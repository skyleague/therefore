import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defaultTest } from '../../../../examples/edges/client.schema.js'
import { constants } from '../../constants.js'
import { $restclient } from '../../primitives/restclient/restclient.js'
import { $string } from '../../primitives/string/string.js'
import { ValidatorType } from '../../primitives/validator/validator.js'
import { defaultTypescriptOutput } from './cst.js'

describe('restclient', () => {
    it.each([
        ['ajv', 'ajv' as const],
        ['zod', 'zod' as const],
        ['default', undefined],
    ])('should generate %s output', async (_, validator) => {
        const node = await $restclient(defaultTest, validator !== undefined ? { validator } : undefined)

        const outputs = defaultTypescriptOutput(node)
        expect(outputs[0]?.isGenerated?.(node)).toBe(true)

        for (const child of node._children) {
            {
                const outputs = defaultTypescriptOutput(ValidatorType._root(child))
                for (const output of outputs.filter((o) => o.enabled?.(child))) {
                    expect(output.isGenerated?.(child)).toBe(true)
                    expect(output.subtype).toBe(child._attributes.validator?.type)
                    expect(output.subtype).toBe(validator ?? 'ajv')
                }
            }
            {
                const outputs = defaultTypescriptOutput(child)
                for (const output of outputs.filter((o) => o.enabled?.(child))) {
                    expect(output.isGenerated?.(child)).toBe(true)
                    expect(output.subtype).toBe(child._attributes.validator?.type)
                    expect(output.subtype).toBe(validator ?? 'ajv')
                }
            }
        }
    })
})

describe('default', () => {
    it.each([
        ['ajv', 'ajv' as const],
        ['zod', 'zod' as const],
        ['default', undefined],
    ])('should generate %s output', (_, validator) => {
        const node = $string().validator()

        for (const child of [...(node._children ?? []), node]) {
            {
                const validatorNode = ValidatorType._root(child)
                if (validator !== undefined) {
                    validatorNode.validator({ type: validator })
                }
                const outputs = defaultTypescriptOutput(validatorNode)
                for (const output of outputs.filter((o) => o.enabled?.(validatorNode))) {
                    expect(output.isGenerated?.(validatorNode)).toBe(true)
                    expect(output.subtype).toBe(validatorNode._attributes.validator?.type ?? 'ajv')
                    expect(output.subtype).toBe(validator ?? 'ajv')
                }
            }
            {
                const outputs = defaultTypescriptOutput(child)
                if (validator !== undefined) {
                    child.validator({ type: validator })
                }
                for (const output of outputs.filter((o) => o.enabled?.(child))) {
                    expect(output.isGenerated?.(child)).toBe(true)
                    expect(output.subtype).toBe(child._attributes.validator?.type ?? 'ajv')
                    expect(output.subtype).toBe(validator ?? 'ajv')
                }
            }
        }
    })
})

describe('migrate', () => {
    const migrateDefault = constants.migrate

    beforeEach(() => {
        constants.migrate = true
        constants.migrateToValidator = 'zod'
    })

    afterEach(() => {
        constants.migrate = migrateDefault
        constants.migrateToValidator = undefined
    })

    it.each([
        // ['ajv', 'ajv' as const],
        ['zod', 'zod' as const],
        ['default', undefined],
    ])('should generate %s output', (_, validator) => {
        const node = $string().validator()

        for (const child of [...(node._children ?? []), node]) {
            {
                const validatorNode = ValidatorType._root(child)
                if (validator !== undefined) {
                    validatorNode.validator({ type: validator })
                }
                const outputs = defaultTypescriptOutput(validatorNode)
                for (const output of outputs.filter((o) => o.enabled?.(validatorNode))) {
                    expect(output.isGenerated?.(validatorNode)).toBe(false)
                    expect(output.subtype).toBe(validator ?? 'zod')
                }
            }
            {
                const outputs = defaultTypescriptOutput(child)
                if (validator !== undefined) {
                    child.validator({ type: validator })
                }
                for (const output of outputs.filter((o) => o.enabled?.(child))) {
                    expect(output.isGenerated?.(child)).toBe(false)
                    expect(output.subtype).toBe(child._attributes.validator?.type ?? 'zod')
                    expect(output.subtype).toBe(validator ?? 'zod')
                }
            }
        }
    })

    it.each([
        ['ajv', 'ajv' as const],
        ['zod', 'zod' as const],
        ['default', undefined],
    ])('should generate restclient %s output', async (_, validator) => {
        const node = await $restclient(defaultTest, validator !== undefined ? { validator } : undefined)

        const outputs = defaultTypescriptOutput(node)
        expect(outputs[0]?.isGenerated?.(node)).toBe(true)

        for (const child of node._children) {
            {
                const outputs = defaultTypescriptOutput(ValidatorType._root(child))
                for (const output of outputs.filter((o) => o.enabled?.(child))) {
                    expect(output.isGenerated?.(child)).toBe(true)
                    expect(output.subtype).toBe(child._attributes.validator?.type)
                    expect(output.subtype).toBe(validator ?? 'ajv')
                }
            }
            {
                const outputs = defaultTypescriptOutput(child)
                for (const output of outputs.filter((o) => o.enabled?.(child))) {
                    expect(output.isGenerated?.(child)).toBe(true)
                    expect(output.subtype).toBe(child._attributes.validator?.type ?? validator ?? 'ajv')
                    expect(output.subtype).toBe(validator ?? validator ?? 'ajv')
                }
            }
        }
    })
})
