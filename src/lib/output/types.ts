import type { GenericFileOutput } from './generic.js'
import type { TypescriptFileOutput } from './typescript.js'

export type ThereforeOutputType = 'json' | 'typescript' | 'graphql'

export type TargetPath = string
export type ThereforeOutput = Record<TargetPath, GenericFileOutput | TypescriptFileOutput>
