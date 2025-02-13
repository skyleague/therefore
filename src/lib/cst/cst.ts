import { isObject } from '@skyleague/axioms'
import type { GenericReferences, TypescriptReferences } from '../../commands/generate/output/references.js'
import type { ThereforeOutputType } from '../../commands/generate/output/types.js'
import type { JsonAnnotations } from '../../json.js'
import type { DefinedTypescriptOutput } from '../visitor/typescript/cst.js'
import type { TypescriptTypeWalkerContext } from '../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../visitor/typescript/typescript-zod.js'
import type { Node, SourceNode } from './node.js'

export type ThereforeExpr = Node | (() => Node)

export interface ThereforeOutputFile {
    enabled?: (node: Node) => boolean
    onExport?: ((node: Node) => void)[]
    targetPath?: (node: SourceNode) => string
    clean?: (targetPath: string) => void
    type: string
}

export interface TypescriptOutput<Context extends TypescriptTypeWalkerContext | TypescriptZodWalkerContext>
    extends ThereforeOutputFile {
    context?: (args: {
        targetPath: string
        symbol?: Node
        references?: TypescriptReferences
        locals?: [
            Node,
            (
                | ((
                      output:
                          | DefinedTypescriptOutput<TypescriptTypeWalkerContext>
                          | DefinedTypescriptOutput<TypescriptZodWalkerContext>,
                  ) => boolean)
                | undefined
            ),
        ][]
        exportSymbol: boolean
    }) => Context
    definition?: (node: Node, context: Context) => string | undefined
    isGenerated?: (node: Node) => boolean
    subtype: 'zod' | 'ajv' | undefined
    isTypeOnly: boolean
    content?: false
    type: 'typescript'
}

/**
 * TypeScript code generation attributes that control how symbols, types, and modules are handled.
 * The attributes are split into two main categories:
 * 1. Value-level attributes (prefixed with 'value:'): Handle runtime constructs like variables, functions, and classes
 * 2. Type-level attributes (prefixed with 'type:'): Handle type system constructs like interfaces and type aliases
 */
export interface TypescriptAttributes {
    /**
     * Controls how a value is exported from its module.
     * Used for runtime exports (const/let/var/class/function).
     *
     * Example:
     * ```ts
     * // If value:export is "MyExportedFunction"
     * export { myFunction as MyExportedFunction }
     * ```
     */
    'value:export'?: string

    /**
     * Controls how a type is exported from its module.
     * Used for type-level exports (type/interface).
     *
     * Example:
     * ```ts
     * // If type:export is "MyExportedType"
     * export { MyType as MyExportedType }
     * ```
     */
    'type:export'?: string

    /**
     * The local name of a value within the current module scope.
     * Used when the internal name needs to differ from the source name.
     *
     * Example:
     * ```ts
     * // If value:name is "localFunction"
     * const localFunction = importedFunction
     * ```
     */
    'value:name'?: string

    /**
     * The base identifier for a value. This is the primary name used for the value
     * and serves as the default for other value-related attributes if they're not specified.
     * Required for proper symbol resolution.
     *
     * Example:
     * ```ts
     * // If value:source is "processData"
     * const processData = ...
     * ```
     */
    'value:source': string

    /**
     * The file path where a value is defined.
     * Used for import resolution and module organization.
     * Critical for determining when and how to generate imports.
     *
     * Example:
     * ```ts
     * // If value:path is "./models/user.ts"
     * import { User } from './models/user.js'
     * ```
     */
    'value:path'?: string

    /**
     * The local name of a type within the current module scope.
     * Used when the internal type name needs to differ from its source name.
     *
     * Example:
     * ```ts
     * // If type:name is "LocalUserType"
     * type LocalUserType = ImportedUser
     * ```
     */
    'type:name'?: string

    /**
     * The base identifier for a type. This is the primary name used for the type
     * and serves as the default for other type-related attributes if they're not specified.
     * Required for proper type resolution.
     *
     * Example:
     * ```ts
     * // If type:source is "UserData"
     * interface UserData { ... }
     * ```
     */
    'type:source': string

    /**
     * Used for complex type references, particularly in generic contexts or
     * when types need special handling during reference resolution.
     * Helps manage type references across module boundaries.
     *
     * Example:
     * ```ts
     * // If type:reference is "Record<string, User>"
     * type UserMap = Record<string, User>
     * ```
     */
    'type:reference'?: string

    /**
     * The file path where a type is defined.
     * Used for type import resolution and module organization.
     * Critical for determining when and how to generate type imports.
     *
     * Example:
     * ```ts
     * // If type:path is "./types/user.ts"
     * import type { User } from './types/user.js'
     * ```
     */
    'type:path'?: string

    /**
     * Indicates if the node represents a module.
     * Affects how imports and exports are handled.
     * When true, special module-level processing is applied.
     */
    isModule?: boolean
}

export interface GenericAttributes {
    'value:name': string
    'jsonschema:path'?: string
}

export interface GenericOutput extends ThereforeOutputFile {
    targetPath: (node: SourceNode) => string
    content: (options: GenericOutput, args: { references: GenericReferences }) => string
    type: 'file'
    subtype: (() => ThereforeOutputType) | ThereforeOutputType
    prettify?: () => boolean
}

export interface ThereforeNodeDefinition<T = unknown> {
    jsonschema?: JsonAnnotations<T> | undefined

    /**
     * Describes the name of the field.
     */
    description?: string | undefined

    /**
     * Specifies the default value that is used when no value is found during validation (dependend on validation options).
     */
    default?: T | undefined

    /**
     * The property is marked explicitly as `readonly`, and any changes to the value should be avoided.
     *
     * @example
     *
     *      $string({readonly: true})
     */
    readonly?: boolean | undefined

    /**
     *  This indicates that applications SHOULD refrain from usage of the declared property. It MAY mean the property is going to be removed in the future.
     *
     * @deprecated
     */
    deprecated?: boolean | undefined
}

/**
 * Checks whether the given object is a valid therefore schema node.
 *
 * @param x - The node to check.
 * @returns Checks if `x` is a ThereforeNode.
 *
 * @group Guards
 */
export function isNode(x: unknown): x is Node {
    return isObject(x) && '_type' in x && '_id' in x
}
