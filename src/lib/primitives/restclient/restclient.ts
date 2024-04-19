import type { OpenapiV3 } from '../../../types/openapi.type.js'
import { EitherHelper, RestClientBuilder } from './builder.js'

import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { type Hooks, Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'

import path from 'node:path'

export interface RestClientOptions {
    filename?: string | undefined

    /**
     * Toggles whether the given operationId should be preferred over the generated value.
     *
     * @defaultValue true
     */
    preferOperationId?: boolean
    /**
     * @defaultValue false
     */
    strict?: boolean
    /**
     * Toggles whether optional fields will be allowed to be null. Some Rest APIs implicitly return null on optional fields.
     *
     * @defaultValue false
     */
    optionalNullable?: boolean
    /**
     * Toggle whether intersection types are allowed. In a lot of cases, intersection types aren't properly defined, and will break validation by jsonschema
     * You can choose to allow them, but keep in mind to verify the behavior.
     *
     * @defaultValue false
     */
    allowIntersectionTypes?: boolean
    /**
     * Toggles whether an Either interface is generated or exceptions are used.
     *
     * @defaultValue true
     */
    useEither?: boolean
    /**
     * Toggles whether the content type header should always be part of the request.
     *
     * @defaultValue false
     */
    explicitContentNegotiation?: boolean
    /**
     * Whether the validators should be compiled.
     *
     * @defaultValue undefined
     */
    compile?: boolean
    /**
     * Allows for a transformation of the standardized openapi schema (swagger gets automatically converted to
     * openapiv3).
     */
    transformOpenapi?: (openapi: OpenapiV3) => OpenapiV3
}

export class RestclientType extends Node {
    public override type = 'restclient' as const
    public override children: Node[]

    public options: RestClientOptions = {}

    public builder: RestClientBuilder

    private constructor(builder: RestClientBuilder, options: SchemaOptions<RestClientOptions>) {
        super({
            ...options,
            description: builder.openapi.info.description,
        })
        this.options = options
        this.builder = builder

        this.definition.jsonschema ??= {
            title: builder.openapi.info.title,
        }

        this.children = builder.children
        this.connections = builder.children
    }

    public static async from(definition: OpenapiV3, options: SchemaOptions<RestClientOptions>) {
        return new RestclientType(await RestClientBuilder.from(definition, options), options)
    }

    public targetPath(sourcePath: string) {
        if (this.options.filename !== undefined) {
            const dir = path.dirname(sourcePath)
            return path.join(dir, this.options.filename)
        }
        return replaceExtension(sourcePath, '.client.ts')
    }

    public override hooks: Hooks = {
        onExport: [
            (node) => {
                const newSourcePath = this.targetPath(node.sourcePath)
                for (const child of this.builder.children) {
                    child.sourcePath = newSourcePath
                }
                node.sourcePath = newSourcePath

                if (this.options.useEither !== false) {
                    const instance = EitherHelper.from(newSourcePath)
                    node.children?.push(instance)
                    node.connections?.push(instance)
                }
            },
        ],
    }

    public override get output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                targetPath: ({ sourcePath }) => sourcePath,
                type: 'typescript',
                definition: (node, context) => {
                    return this.builder.definition(node, context)
                },
            },
        ]
    }
}

/**
 * Create a new `CustomType` instance with the given options.
 *
 * ### Example
 * ```ts
 * export const petStore = got
    .get('https://petstore3.swagger.io/api/v3/openapi.json')
    .json<OpenapiV3>()
    .then((data) => $restclient(data, { strict: false }))
 * ```
 *
 * @param schema - The JSON Draft 7 schema.
 * @param options - Additional options to pass to the tuple.
 *
 * @group Schema
 */
export function $restclient(definition: OpenapiV3, options: Partial<RestClientOptions> = {}): Promise<RestclientType> {
    return RestclientType.from(definition, options)
}
