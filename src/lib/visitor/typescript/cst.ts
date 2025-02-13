import fs from 'node:fs'
import type { SetRequired } from '@skyleague/axioms/types'
import { replaceExtension } from '../../../common/template/path.js'
import { constants } from '../../constants.js'
import type { TypescriptOutput } from '../../cst/cst.js'
import type { Node } from '../../cst/node.js'
import { type TypescriptTypeWalkerContext, buildTypescriptTypeContext } from './typescript-type.js'
import { type TypescriptZodWalkerContext, buildTypescriptZodContext } from './typescript-zod.js'

const defaultZodOutput = (node: Node) => {
    const output = {
        type: 'typescript',
        subtype: 'zod',
        context: ({ symbol, references, locals, exportSymbol, targetPath }) =>
            buildTypescriptZodContext({
                targetPath,
                symbol,
                exportSymbol,
                references,
                locals,
            }),
        targetPath: ({ _sourcePath: sourcePath }) => {
            if (output.isGenerated(node)) {
                return replaceExtension(sourcePath, constants.defaultZodTypescriptOutExtension)
            }
            return replaceExtension(sourcePath, '.ts')
        },
        clean: () => {
            if (!output.isGenerated(node) && node._sourcePath !== undefined) {
                if (fs.existsSync(node._sourcePath)) {
                    console.log('Cleaning', node._sourcePath)
                    fs.unlinkSync(node._sourcePath)
                }
            }
        },
        definition: (self, context) => {
            if (self._isRecurrent) {
                return undefined
            }
            if (self._origin.zod !== undefined) {
                return undefined
            }

            self._attributes.typescript['value:path'] = context.targetPath
            return `${context.declare('const', self)} = ${context.render(self)}`
        },
        enabled: (node) => node._validator.type === 'zod',
        isTypeOnly: false,
        isGenerated: (node) => node._attributes.isGenerated,
    } satisfies DefinedTypescriptOutput<TypescriptZodWalkerContext>
    return output
}

const defaultAjvOutput = (_: Node) => {
    const output = {
        type: 'typescript',
        subtype: 'ajv',
        context: ({ symbol, references, locals, exportSymbol, targetPath }) =>
            buildTypescriptTypeContext({
                targetPath,
                symbol,
                exportSymbol,
                references,
                locals,
            }),
        targetPath: ({ _sourcePath: sourcePath }) => {
            return replaceExtension(sourcePath, constants.defaultTypescriptOutExtension)
        },
        definition: (self, context) => {
            self._attributes.typescript['type:path'] = context.targetPath
            return `${context.declare('type', self)} = ${context.render(self)}`
        },
        enabled: (node) => node._validator.type === 'ajv',
        isTypeOnly: true,
        isGenerated: (node) => node._attributes.isGenerated,
    } satisfies DefinedTypescriptOutput<TypescriptTypeWalkerContext>
    return output
}

export type DefinedTypescriptOutput<Type extends TypescriptZodWalkerContext | TypescriptTypeWalkerContext> = SetRequired<
    TypescriptOutput<Type>,
    'targetPath' | 'definition'
>
export function defaultTypescriptOutput(
    node: Node,
): (DefinedTypescriptOutput<TypescriptZodWalkerContext> | DefinedTypescriptOutput<TypescriptTypeWalkerContext>)[] {
    const defaultZod = defaultZodOutput(node)
    const defaultAjv = defaultAjvOutput(node)
    const generators: (
        | DefinedTypescriptOutput<TypescriptZodWalkerContext>
        | DefinedTypescriptOutput<TypescriptTypeWalkerContext>
    )[] =
        node._output
            ?.filter(
                (o): o is TypescriptOutput<TypescriptZodWalkerContext> | TypescriptOutput<TypescriptTypeWalkerContext> =>
                    o.type === 'typescript',
            )
            .map((x) => {
                const { onExport, ...rest } = x
                if (x.subtype === undefined) {
                    return {
                        ...defaultAjv,
                        onExport: [...(onExport ?? [])],
                        enabled: () => true,
                        ...rest,
                    } as DefinedTypescriptOutput<TypescriptTypeWalkerContext>
                }
                if (x.subtype === 'ajv') {
                    return {
                        ...defaultAjv,
                        onExport: [...(onExport ?? [])],
                        ...rest,
                    } as DefinedTypescriptOutput<TypescriptTypeWalkerContext>
                }
                if (x.subtype === 'zod') {
                    return {
                        ...defaultZod,
                        onExport: [...(onExport ?? [])],
                        ...rest,
                    } as DefinedTypescriptOutput<TypescriptZodWalkerContext>
                }
                return {
                    ...defaultAjv,
                    onExport: [...(onExport ?? [])],
                    ...rest,
                } as DefinedTypescriptOutput<TypescriptTypeWalkerContext>
            }) ?? []

    if (node._output === undefined) {
        if (node._validator.type === 'ajv') {
            generators.push(defaultAjv)
        }
        if (node._validator.type === 'zod') {
            generators.push(defaultZod)
        }
    }

    return generators
}
