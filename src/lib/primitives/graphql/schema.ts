import { isString, mapValues, memoize, omitUndefined } from '@skyleague/axioms'
import { minifyIntrospectionQuery } from '@urql/introspection'
import {
    GraphQLBoolean,
    GraphQLEnumType,
    type GraphQLFieldConfig,
    type GraphQLFieldConfigArgumentMap,
    GraphQLFloat,
    type GraphQLInputFieldConfig,
    GraphQLInputObjectType,
    type GraphQLInputType,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    type GraphQLOutputType,
    GraphQLSchema,
    GraphQLString,
    type GraphQLType,
    GraphQLUnionType,
    introspectionFromSchema,
    isNullableType,
    lexicographicSortSchema,
    printSchema,
} from 'graphql'
import type { GenericReferences } from '../../../commands/generate/output/references.js'
import { replaceExtension } from '../../../common/template/path.js'
import { type GenericOutput, type TypescriptOutput, isNode } from '../../cst/cst.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import { Node } from '../../cst/node.js'
import { type ThereforeVisitor, walkTherefore } from '../../cst/visitor.js'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import type { ObjectType } from '../object/object.js'
import { GraphqlFieldType } from './field.js'

export function annotate(node: Node) {
    return {
        description: node._definition.description,
    }
}

export interface GraphqlWalkerContext {
    branch: Node | undefined
    current: Node | undefined
    cache: {
        input: Record<string, GraphQLInputType>
        output: Record<string, GraphQLOutputType>
        common: Record<string, GraphQLType>
    }
    references: GenericReferences
    output: (obj: Node) => GraphQLOutputType
    input: (obj: Node) => GraphQLInputType
    transform: (obj: Node, schema: GraphQLOutputType) => GraphQLOutputType
}

export function buildContext(obj: Node | undefined, { references }: { references: GenericReferences }): GraphqlWalkerContext {
    const context: GraphqlWalkerContext = {
        branch: obj,
        current: obj,
        cache: {
            input: {},
            output: {},
            common: {},
        },
        references,
        output: (node: Node) => {
            const previous = context?.current
            const branch = context.branch

            context.current = node

            if (previous?._isCommutative !== true) {
                context.branch = node
            }

            const value = walkTherefore(node, graphqlOutputVisitor, context)

            context.current = previous
            context.branch = branch
            return value
        },
        input: (node: Node) => {
            const previous = context?.current
            const branch = context.branch

            context.current = node

            if (previous?._isCommutative !== true) {
                context.branch = node
            }

            const value = walkTherefore(node, graphqlInputVisitor, context)

            context.current = previous
            context.branch = branch
            return value
        },
        transform: (_, schema) => {
            if (context.branch === undefined || !(hasNullablePrimitive(context.branch) || hasOptionalPrimitive(context.branch))) {
                if (isNullableType(schema)) {
                    return new GraphQLNonNull(schema)
                }
            }
            return schema
        },
    }
    return context
}

export const graphqlVisitor: ThereforeVisitor<GraphQLOutputType & GraphQLInputType, GraphqlWalkerContext> = {
    string: (_node) => GraphQLString,
    number: (_node) => GraphQLFloat,
    integer: (_node) => GraphQLInt,
    boolean: (_node) => GraphQLBoolean,
    // null: () => new GraphQLScalarType('null'),
    // unknown: () => ({}),
    enum: (node, { references }) => {
        if (node._isNamed) {
            return new GraphQLEnumType({
                name: references.hardlink(node, 'value:name'),
                values: Object.fromEntries(Object.entries(node.enum).map(([name, value]) => [name, { value }] as const)),
                ...annotate(node),
            })
        }
        const values = node.enum
        if (values.every(isString)) {
            return new GraphQLEnumType({
                name: references.hardlink(node, 'value:name'),
                values: Object.fromEntries(values.filter(isString).map((value) => [value, { value }] as const)),
                ...annotate(node),
            })
        }

        // this is ill defined, maybe custom scalars are needed
        // return new GraphQLEnumType({
        //     name: node.template.reference.safeSymbolName(),
        //     values: Object.fromEntries(node.values.map((value, i) => [`foo${i}`, { value }] as const)),
        // })
        throw new Error('enum values must be strings')
    },
    default: (node) => {
        console.error(node)
        throw new Error('should not be called')
    },
}

export const graphqlOutputVisitor: ThereforeVisitor<GraphQLOutputType, GraphqlWalkerContext> = {
    ...graphqlVisitor,
    nullable: ({ _children: [node] }, context) => context.output(node),
    optional: ({ _children: [node] }, context) => context.output(node),
    union: (node, context) => {
        const { _children } = node
        if (_children.every((c) => c._type === 'object')) {
            return new GraphQLUnionType({
                name: context.references.hardlink(node, 'value:name', { suffix: 'output' }),
                types: () =>
                    _children.map((child) => graphqlOutputVisitor.object?.(child as ObjectType, context) as GraphQLObjectType),
                ...annotate(node),
            })
        }
        throw new Error('unions must be objects')
    },

    // intersection: ({ children }, context) => {
    //     return {
    //         allOf: children.map((u) =>
    //             context.render({
    //                 ...u,
    //                 value: {
    //                     ...u.value,
    //                     // force non strict subsets
    //                     additionalProperties: true,
    //                 },
    //             })
    //         ),
    //     }
    // },
    ref: ({ _children: [ref] }, { cache, output }) => {
        const cacheType = ref._type in graphqlOutputVisitor && !(ref._type in graphqlVisitor) ? cache.output : cache.common
        if (cacheType[ref._id] === undefined) {
            cacheType[ref._id] = output(ref)
        }
        return cacheType[ref._id] as GraphQLOutputType
    },
    object: (obj, context) => {
        const { shape } = obj
        return new GraphQLObjectType({
            name: context.references.hardlink(obj, 'value:name', { suffix: 'output' }),
            fields: () =>
                Object.fromEntries(
                    Object.entries(shape).map(([name, node]) => {
                        const output =
                            node instanceof GraphqlFieldType
                                ? toGraphqlField(node, context)
                                : { type: context.output(node), ...annotate(node) }
                        return [name, output satisfies GraphQLFieldConfig<unknown, unknown>] as const
                    }),
                ),

            ...annotate(obj),
        })
    },
    array: ({ _children: [element] }, context) => {
        return new GraphQLList(context.output(element))
    },
    // tuple: ({ children }, context) => {
    // },
    // record: ({ children }, context) => {
    // },
    default: (node) => {
        console.error(node)
        throw new Error('should not be called')
    },
}

export const graphqlInputVisitor: ThereforeVisitor<GraphQLInputType, GraphqlWalkerContext> = {
    ...graphqlVisitor,
    nullable: ({ _children: [node] }, context) => context.input(node),
    optional: ({ _children: [node] }, context) => context.input(node),
    ref: ({ _children: [ref] }, { cache, input }) => {
        const cacheType = ref._type in graphqlInputVisitor && !(ref._type in graphqlVisitor) ? cache.input : cache.common
        if (cacheType[ref._id] === undefined) {
            cacheType[ref._id] = input(ref)
        }
        return cacheType[ref._id] as GraphQLInputType
    },
    object: (obj, context) => {
        const { shape } = obj
        return new GraphQLInputObjectType({
            name: context.references.hardlink(obj, 'value:name', { suffix: 'input' }),
            fields: () =>
                Object.fromEntries(
                    Object.entries(shape).map(([name, node]) => {
                        const output = { type: context.input(node), ...annotate(node) }
                        return [name, output satisfies GraphQLInputFieldConfig] as const
                    }),
                ),

            ...annotate(obj),
        })
    },
    array: ({ _children: [element] }, context) => {
        return new GraphQLList(context.input(element))
    },
    // tuple: ({ children }, context) => {
    // },
    // record: ({ children }, context) => {
    // },
}

export function toGraphqlField(field: GraphqlFieldType, ctx: GraphqlWalkerContext): GraphQLFieldConfig<unknown, unknown> {
    let args: GraphQLFieldConfigArgumentMap | undefined = undefined
    if (isNode(field.args)) {
        args = mapValues(field.args.shape, (p) => ({ type: ctx.input(p) }))
    } else if (field.args !== undefined) {
        args = mapValues(field.args, (type) => ({ type: ctx.input(type) }))
    }
    return omitUndefined({
        type: ctx.output(field.returnType),
        description: field._definition.description,
        args,
    })
}

export interface GraphqlSchemaOptions {
    query: Record<string, GraphqlFieldType>
    mutation?: Record<string, GraphqlFieldType>
    subscription?: Record<string, GraphqlFieldType>
    introspection?: boolean
}

export class GraphQLSchemaType extends Node {
    public override _type = 'graphql:schema' as const
    public override _children: GraphqlFieldType[]
    public override _canReference: false = false
    public _genericReferences: GenericReferences | undefined = undefined

    public query: Record<string, GraphqlFieldType> = {}
    public mutation: Record<string, GraphqlFieldType> | undefined
    public subscription: Record<string, GraphqlFieldType> | undefined
    public introspection

    public schema = memoize(() => {
        if (this._genericReferences === undefined) {
            throw new Error('references must be provided')
        }
        const context = buildContext(undefined, { references: this._genericReferences })

        const graphqlSchema = lexicographicSortSchema(
            new GraphQLSchema({
                query: new GraphQLObjectType({
                    name: 'Query',
                    fields: mapValues(this.query, (node) => toGraphqlField(node, context)),
                }),
                mutation:
                    this.mutation !== undefined
                        ? new GraphQLObjectType({
                              name: 'Mutation',
                              fields: mapValues(this.mutation, (node) => toGraphqlField(node, context)),
                          })
                        : undefined,
                subscription:
                    this.subscription !== undefined
                        ? new GraphQLObjectType({
                              name: 'Subscription',
                              fields: mapValues(this.subscription, (node) => toGraphqlField(node, context)),
                          })
                        : undefined,
            }),
        )
        const graphqlFile = printSchema(graphqlSchema)
        const introspection = this._genericReferences.render(
            JSON.stringify(minifyIntrospectionQuery(introspectionFromSchema(graphqlSchema))),
        )
        return { graphqlFile, introspection }
    })

    public constructor({ query, mutation, subscription, introspection = false }: GraphqlSchemaOptions) {
        super()
        this.query = query
        this.mutation = mutation
        this.subscription = subscription
        this._children = [...Object.values(query)]
        this.introspection = introspection
    }

    public override get _output(): (TypescriptOutput<TypescriptTypeWalkerContext> | GenericOutput)[] {
        return [
            {
                type: 'file',
                subtype: 'graphql',
                targetPath: ({ _sourcePath: sourcePath }) => {
                    return replaceExtension(sourcePath, '.graphql')
                },
                // not yet supported
                prettify: () => true,
                content: (_, { references }) => {
                    this._genericReferences = references
                    const { graphqlFile } = this.schema()
                    return graphqlFile
                },
            },
            {
                type: 'typescript',
                subtype: undefined,
                isGenerated: () => true,
                isTypeOnly: false,
                enabled: () => this.introspection,
                definition: (node, context) => {
                    // biome-ignore lint/style/noNonNullAssertion: is set on evaluation in the other output
                    context.references.from(this._genericReferences!)

                    node._attributes.typescript['value:source'] = 'introspection'
                    node._attributes.typescript['value:path'] = context.targetPath
                    node._attributes.typescript['type:path'] = context.targetPath

                    const { introspection } = this.schema()
                    // @TODO hacky but it works
                    return `${context.declare('const', node)} = ${introspection.replaceAll(':name}}', ':source}}')} as const`
                },
            },
        ]
    }
}

export function $schema({ query, mutation, subscription, introspection }: GraphqlSchemaOptions): GraphQLSchemaType {
    return new GraphQLSchemaType(omitUndefined({ query, mutation, subscription, introspection }))
}
