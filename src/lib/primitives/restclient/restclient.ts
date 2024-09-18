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
     * Whether to check format types with https://ajv.js.org/packages/ajv-formats.html
     * @defaultValue true
     */
    formats?: boolean
    /**
     * Allows for a transformation of the standardized openapi schema (swagger gets automatically converted to
     * openapiv3).
     */
    transformOpenapi?: (openapi: OpenapiV3) => OpenapiV3
    client?: 'got' | 'ky'
}

export class RestclientType extends Node {
    public override _type = 'restclient' as const
    public override _children: Node[]

    public _options: RestClientOptions = {}

    public _builder: RestClientBuilder
    public override _canReference: false = false

    private constructor(builder: RestClientBuilder, options: SchemaOptions<RestClientOptions>) {
        super({
            ...options,
            description: builder.openapi.info.description,
        })
        this._options = options
        this._builder = builder

        this._definition.jsonschema ??= {
            title: builder.openapi.info.title,
        }

        this._children = builder.children
        this._connections = builder.children
    }

    public static async from(definition: OpenapiV3, options: SchemaOptions<RestClientOptions>) {
        return new RestclientType(await RestClientBuilder.from(definition, options), options)
    }

    public targetPath(sourcePath: string) {
        if (this._options.filename !== undefined) {
            const dir = path.dirname(sourcePath)
            return path.join(dir, this._options.filename)
        }
        return replaceExtension(sourcePath, '.client.ts')
    }

    public override _hooks: Hooks = {
        onExport: [
            (node) => {
                const newSourcePath = this.targetPath(node._sourcePath)
                for (const child of this._builder.children) {
                    child._sourcePath = newSourcePath
                }
                node._sourcePath = newSourcePath

                if (this._options.useEither !== false) {
                    const instance = EitherHelper.from(newSourcePath)
                    node._children?.push(instance)
                    node._connections?.push(instance)
                }
            },
        ],
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => sourcePath,
                type: 'typescript',
                definition: (node, context) => {
                    return this._builder.definition(node, context)
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
