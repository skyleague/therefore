import { GraphqlFieldType } from './field.js'

import { replaceExtension } from '../../../common/template/path.js'
import { type GenericOutput, type TypescriptOutput, isNode } from '../../cst/cst.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import { Node } from '../../cst/node.js'
import { type ThereforeVisitor, walkTherefore } from '../../cst/visitor.js'
import type { References } from '../../output/references.js'
import type { ObjectType } from '../object/object.js'

import { type ConstExpr, all, isString, mapValues, memoize, omitUndefined } from '@skyleague/axioms'
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

export function annotate(node: Node) {
    return {
        description: node.definition.description,
    }
}

export interface GraphqlWalkerContext {
    cache: {
        input: Record<string, GraphQLInputType>
        output: Record<string, GraphQLOutputType>
        common: Record<string, GraphQLType>
    }
    references: References<'generic'>
    output: (obj: Node) => GraphQLOutputType
    input: (obj: Node) => GraphQLInputType
    transform: (obj: Node, schema: GraphQLOutputType) => GraphQLOutputType
}

export function buildContext({ references }: { references: References<'generic'> }): GraphqlWalkerContext {
    const context: GraphqlWalkerContext = {
        cache: {
            input: {},
            output: {},
            common: {},
        },
        references,
        output: (node: Node) => walkTherefore(node, graphqlOutputVisitor, context),
        input: (node: Node) => walkTherefore(node, graphqlInputVisitor, context),
        transform: (node, schema) => {
            if (!(hasNullablePrimitive(node) || hasOptionalPrimitive(node))) {
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
        if (node.isNamed) {
            return new GraphQLEnumType({
                name: references.hardlink(node, 'symbolName'),
                values: Object.fromEntries(node.values.map(([name, value]) => [name, { value }] as const)),
                ...annotate(node),
            })
        }
        const values = node.values
        if (all(values, isString)) {
            return new GraphQLEnumType({
                name: references.hardlink(node, 'symbolName'),
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

export const graphqlOutputVisitor: ThereforeVisitor<ConstExpr<GraphQLOutputType>, GraphqlWalkerContext> = {
    ...graphqlVisitor,
    union: (node, context) => {
        const { children } = node
        if (children.every((c) => c.type === 'object')) {
            return new GraphQLUnionType({
                name: context.references.hardlink(node, 'symbolName', { tag: 'output' }),
                types: () =>
                    children.map((child) => graphqlOutputVisitor.object?.(child as ObjectType, context) as GraphQLObjectType),
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
    ref: ({ children: [ref] }, { cache, output }) => {
        const cacheType = ref.type in graphqlOutputVisitor && !(ref.type in graphqlVisitor) ? cache.output : cache.common
        if (cacheType[ref.id] === undefined) {
            cacheType[ref.id] = output(ref)
        }
        return cacheType[ref.id] as GraphQLOutputType
    },
    object: (obj, context) => {
        const { shape } = obj
        return new GraphQLObjectType({
            name: context.references.hardlink(obj, 'symbolName', { tag: 'output' }),
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
    array: (obj, context) => {
        const {
            children: [element],
        } = obj
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
    ref: ({ children: [ref] }, { cache, input }) => {
        const cacheType = ref.type in graphqlInputVisitor && !(ref.type in graphqlVisitor) ? cache.input : cache.common
        if (cacheType[ref.id] === undefined) {
            cacheType[ref.id] = input(ref)
        }
        return cacheType[ref.id] as GraphQLInputType
    },
    object: (obj, context) => {
        const { shape } = obj
        return new GraphQLInputObjectType({
            name: context.references.hardlink(obj, 'symbolName', { tag: 'input' }),
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
    array: (obj, context) => {
        const {
            children: [element],
        } = obj
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
        description: field.definition.description,
        args,
    })
}

export interface GraphqlSchemaOptions {
    query: Record<string, GraphqlFieldType>
    mutation?: Record<string, GraphqlFieldType>
    subscription?: Record<string, GraphqlFieldType>
}

export class GraphQLSchemaType extends Node {
    public override type = 'graphql:schema' as const
    public override children: GraphqlFieldType[]

    public query: Record<string, GraphqlFieldType> = {}
    public mutation: Record<string, GraphqlFieldType> | undefined
    public subscription: Record<string, GraphqlFieldType> | undefined

    public genericReferences: References<'generic'> | undefined = undefined
    public schema = memoize(() => {
        if (this.genericReferences === undefined) {
            throw new Error('references must be provided')
        }
        const context = buildContext({ references: this.genericReferences })

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
        const introspection = this.genericReferences.render(
            JSON.stringify(minifyIntrospectionQuery(introspectionFromSchema(graphqlSchema))),
        )
        return { graphqlFile, introspection }
    })

    public constructor({ query, mutation, subscription }: GraphqlSchemaOptions) {
        super()
        this.query = query
        this.mutation = mutation
        this.subscription = subscription
        this.children = [...Object.values(query)]
    }

    public override get output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'file',
                subtype: 'graphql',
                targetPath: ({ sourcePath }) => {
                    return replaceExtension(sourcePath, '.graphql')
                },
                // not yet supported
                prettify: () => false,
                content: (_, { references }) => {
                    this.genericReferences = references
                    const { graphqlFile } = this.schema()
                    return graphqlFile
                },
            },
            {
                type: 'typescript',
                definition: (node, context) => {
                    // biome-ignore lint/style/noNonNullAssertion: is set on evaluation in the other output
                    context.references.from(this.genericReferences!)
                    node.attributes.typescript.symbolName = 'introspection'
                    const { introspection } = this.schema()
                    return `${context.declare('const', node)} = ${introspection} as const`
                },
            },
        ]
    }
}

export function $schema({ query, mutation, subscription }: GraphqlSchemaOptions): GraphQLSchemaType {
    return new GraphQLSchemaType(omitUndefined({ query, mutation, subscription }))
}
