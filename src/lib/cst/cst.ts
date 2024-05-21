import type { Node, SourceNode } from './node.js'

import { isObject } from '@skyleague/axioms'
import type {} from '@skyleague/axioms/types'
import type { JsonAnnotations } from '../../json.js'
import type { References } from '../output/references.js'
import type { ThereforeOutputType } from '../output/types.js'
import type { ValidatorOptions } from '../primitives/validator/validator.js'
import type { TypescriptWalkerContext } from '../visitor/typescript/typescript.js'

export type ThereforeExpr = Node | (() => Node)

export interface ThereforeOutputFile {
    onExport?: ((node: Node) => void)[]
    targetPath?: (node: SourceNode) => string
    clean?: (targetPath: string) => void
    type: string
}

export interface TypescriptOutput extends ThereforeOutputFile {
    definition?: (node: Node, context: TypescriptWalkerContext) => string | undefined
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

    validator?: Partial<ValidatorOptions> | undefined
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
