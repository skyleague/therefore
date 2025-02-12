import { isString, mapValues, memoize, omitUndefined, sha256 } from '@skyleague/axioms'
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
import type { GenericReferences, TypescriptReferences } from '../../../commands/generate/output/references.js'
import { replaceExtension } from '../../../common/template/path.js'
import { type GenericOutput, type TypescriptOutput, isNode } from '../../cst/cst.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import { Node } from '../../cst/node.js'
import { type ThereforeVisitor, walkTherefore } from '../../cst/visitor.js'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import type { ObjectType } from '../object/object.js'
import { GraphqlFieldType } from './field.js'

export class ReferenceRecorder {
    public references = new Map<
        string,
        [node: Node, (node: Node, options: { typescript: TypescriptReferences } | { generic: GenericReferences }) => string]
    >()

    public link({
        node,
        reference,
        suffix,
    }: {
        node: Node
        reference: (node: Node, options: { typescript: TypescriptReferences } | { generic: GenericReferences }) => string
        suffix?: string
    }) {
        const guessedName = node._attributes.generic['value:name'] ?? ''
        const key = `SYMB_${guessedName}_${sha256(node._id).slice(6)}_${suffix}`
        this.references.set(key, [node, reference])
        return key
    }

    public render(content: string, options: { typescript: TypescriptReferences } | { generic: GenericReferences }) {
        let rendered = content
        for (const [key, [node, reference]] of this.references.entries()) {
            rendered = rendered.replaceAll(key, reference(node, options))
        }
        return rendered
    }
}

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
    references: ReferenceRecorder
    output: (obj: Node) => GraphQLOutputType
    input: (obj: Node) => GraphQLInputType
    transform: (obj: Node, schema: GraphQLOutputType) => GraphQLOutputType

    value: (node: Node, options: { typescript: TypescriptReferences } | { generic: GenericReferences }) => string
}

export function buildContext(obj: Node | undefined, { references }: { references: ReferenceRecorder }): GraphqlWalkerContext {
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
        value: (node, options) => {
            if ('typescript' in options) {
                return options.typescript.valueSource(node)
            }
            return options.generic.name(node)
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
    enum: (node, { references, value }) => {
        if (node._isNamed) {
            return new GraphQLEnumType({
                name: references.link({
                    reference: value,
                    node,
                }),
                values: Object.fromEntries(Object.entries(node.enum).map(([name, value]) => [name, { value }] as const)),
                ...annotate(node),
            })
        }
        const values = node.enum
        if (values.every(isString)) {
            return new GraphQLEnumType({
                name: references.link({
                    reference: value,
                    node,
                }),
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
                name: context.references.link({
                    reference: context.value,
                    suffix: 'output',
                    node,
                }),
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
            name: context.references.link({
                reference: context.value,
                suffix: 'output',
                node: obj,
            }),
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
            name: context.references.link({
                reference: context.value,
                suffix: 'input',
                node: obj,
            }),
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
    public _recorder: ReferenceRecorder = new ReferenceRecorder()

    public query: Record<string, GraphqlFieldType> = {}
    public mutation: Record<string, GraphqlFieldType> | undefined
    public subscription: Record<string, GraphqlFieldType> | undefined
    public introspection

    public schema = memoize(() => {
        const context = buildContext(undefined, { references: this._recorder })
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
        const introspection = JSON.stringify(minifyIntrospectionQuery(introspectionFromSchema(graphqlSchema)))
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
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.graphql'),
                prettify: () => true,
                content: (_, { references }) => {
                    const { graphqlFile } = this.schema()
                    return this._recorder.render(graphqlFile, { generic: references })
                },
            },
            {
                type: 'typescript',
                subtype: undefined,
                isGenerated: () => true,
                isTypeOnly: false,
                enabled: () => this.introspection,
                definition: (node, context) => {
                    node._attributes.typescript['value:source'] = 'introspection'
                    node._attributes.typescript['value:path'] = context.targetPath
                    node._attributes.typescript['type:path'] = context.targetPath

                    const { introspection } = this.schema()

                    return `${context.declare('const', node)} = ${this._recorder.render(introspection, {
                        typescript: context.references,
                    })} as const`
                },
            },
        ]
    }
}

export function $schema({ query, mutation, subscription, introspection }: GraphqlSchemaOptions): GraphQLSchemaType {
    return new GraphQLSchemaType(omitUndefined({ query, mutation, subscription, introspection }))
}
