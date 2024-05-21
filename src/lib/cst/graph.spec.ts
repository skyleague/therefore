import { describe, expect, it } from 'vitest'
import { $object } from '../primitives/object/object.js'
import { $string } from '../primitives/string/string.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from './graph.js'

describe('hasOptionalPrimitive', () => {
    it('should return true if the node is an OptionalType', () => {
        expect(hasOptionalPrimitive($string().optional())).toBe(true)
    })

    it('should return false if the node is not an OptionalType', () => {
        expect(hasOptionalPrimitive($string())).toBe(false)
    })

    it('should return true if the node has an OptionalType child', () => {
        expect(hasOptionalPrimitive($string().optional().optional())).toBe(true)
    })

    it('should return true if the node is an optional object', () => {
        expect(hasOptionalPrimitive($object({ foo: $string }).optional())).toBe(true)
    })

    it('should return false if the object child is optional', () => {
        expect(hasOptionalPrimitive($object({ foo: $string().optional() }))).toBe(false)
    })
})

describe('hasNullablePrimitive', () => {
    it('should return true if the node is an NullableType', () => {
        expect(hasNullablePrimitive($string().nullable())).toBe(true)
    })

    it('should return false if the node is not an NullableType', () => {
        expect(hasNullablePrimitive($string())).toBe(false)
    })

    it('should return true if the node has an NullableType child', () => {
        expect(hasNullablePrimitive($string().nullable().nullable())).toBe(true)
    })

    it('should return true if the node is an nullable object', () => {
        expect(hasNullablePrimitive($object({ foo: $string }).nullable())).toBe(true)
    })

    it('should return false if the object child is nullable', () => {
        expect(hasNullablePrimitive($object({ foo: $string().nullable() }))).toBe(false)
    })
})
