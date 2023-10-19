import type { JsonSchema } from '../../json.js'
import type { ThereforeExpr } from '../../lib/cst/cst.js'
import type { RefType } from '../../lib/primitives/index.js'

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
    schema: ThereforeExpr
    isExported: boolean
    locals?: Record<string, TypescriptDefinition | undefined>
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
    compiledFile?: string | undefined
    definition: TypescriptDefinition
    typeOnly: boolean
}

export interface FileDefinition {
    srcPath: string
    targetPath: string
    attachedFiles: { targetPath: string; content: string; prettify: boolean; type: ThereforeOutputType; clean?: () => void }[]
    symbols: FileSymbol[]
    dependencies: Record<string, string[] | undefined>
    dependencyUsesValue: Record<string, Set<string>>
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
