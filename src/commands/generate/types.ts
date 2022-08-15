import type { JsonSchema } from '../../json'
import type { CstSubNode } from '../../lib/cst/cst'
import type { RefType } from '../../lib/primitives'

import type { ValidateFunction } from 'ajv'

export interface TypescriptReference {
    name: string | undefined
    referenceName: string
    uuid: string
    reference: RefType['children']
    exportSymbol: boolean
}

export interface TypescriptDefinition {
    imports: string[]
    references: TypescriptReference[]
    sourceSymbol: string
    symbolName: string
    uuid: string
    referenceName: string
    uniqueSymbolName: string
    declaration: string
    schema: CstSubNode
    isExported: boolean
    locals?: Record<string, TypescriptDefinition>
}

export type JsonSchemaValidator =
    | {
          compiled: true
          validator: ValidateFunction
          code: string
          schema: JsonSchema
      }
    | {
          compiled?: false
          schema: JsonSchema
          validator?: ValidateFunction
          code?: string
      }

export type ThereforeOutputType = 'jsonschema' | 'typescript' | 'validator'

export interface FileSymbol {
    uuid: string
    symbolName: string
    schemaFile?: string
    compiledFile?: string
    definition: TypescriptDefinition
    typeOnly: boolean
}

export interface FileDefinition {
    srcPath: string
    targetPath: string
    attachedFiles: { targetPath: string; content: string; prettify: boolean; type: ThereforeOutputType }[]
    symbols: FileSymbol[]
    dependencies: Record<string, string[] | undefined>
}

export interface ReferenceData {
    symbolName: string
    referenceName: string
    uniqueSymbolName: string
    srcPath: string
}

export interface OutputFile {
    targetPath: string
    relativeSource: string
    template: string
    data: Record<string, ReferenceData>
    type: ThereforeOutputType
    prettify: boolean
}
