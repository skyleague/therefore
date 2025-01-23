import { isObject } from '@skyleague/axioms'
import type { References } from '../../commands/generate/output/references.js'
import type { ThereforeOutputType } from '../../commands/generate/output/types.js'
import type { JsonAnnotations } from '../../json.js'
import type { DefinedTypescriptOutput } from '../visitor/typescript/cst.js'
import type { TypescriptTypeWalkerContext } from '../visitor/typescript/typescript-type.js'
import type { Node, SourceNode } from './node.js'

export type ThereforeExpr = Node | (() => Node)

export interface ThereforeOutputFile {
    enabled?: (node: Node) => boolean
    onExport?: ((node: Node) => void)[]
    targetPath?: (node: SourceNode) => string
    clean?: (targetPath: string) => void
    type: string
}

export interface TypescriptOutput extends ThereforeOutputFile {
    context?: (args: {
        symbol?: Node
        references?: References<'typescript'>
        locals?: [Node, ((output: DefinedTypescriptOutput) => boolean) | undefined][]
        exportSymbol: boolean
    }) => TypescriptTypeWalkerContext
    definition?: (node: Node, context: TypescriptTypeWalkerContext) => string | undefined
    isGenerated?: (node: Node) => boolean
    subtype: 'zod' | 'ajv' | undefined
    isTypeOnly: boolean
    content?: false
    type: 'typescript'
}

export interface TypescriptAttributes {
    referenceName: string
    symbolName: string
    aliasName?: string
    isModule?: boolean
    path?: string

    schemaPath?: string
}

export interface GenericAttributes {
    referenceName: string
    symbolName: string

    // unused
    aliasName?: string
}

export interface GenericOutput extends ThereforeOutputFile {
    targetPath: (node: SourceNode) => string
    content: (options: GenericOutput, args: { references: References<'generic'> }) => string
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
