import { expect, expectTypeOf, it } from 'vitest'
import { nameonlyPerson, nonamePerson } from './object.schema.js'
import { AgeonlyPerson, NameonlyPerson, NonamePerson } from './object.type.js'

it('should match name-only person type with expected type', () => {
    expectTypeOf(nameonlyPerson.infer).toEqualTypeOf<{ name: string }>()
    expectTypeOf(nameonlyPerson.infer).toEqualTypeOf<NameonlyPerson>()
})

it('should successfully parse a valid name-only person object', () => {
    NameonlyPerson.assert({ name: 'bob' })
})

it('should fail to parse invalid name-only person objects', () => {
    NameonlyPerson.assert({ name: '12' })
    NameonlyPerson.assert({ name: 'bob', age: 12 })
    AgeonlyPerson.assert({ age: 12 })

    expect(NameonlyPerson.is({ name: 'bob', age: 12 })).toEqual(true)
    expect(NameonlyPerson.is({ name: 12 })).toEqual(false)
    expect(NameonlyPerson.is({ age: 12 })).toEqual(false)
})

it('should match non-name person type with expected type', () => {
    expectTypeOf(nonamePerson.infer).toEqualTypeOf<{
        age: number
        nested: {
            pet: string
        }
    }>()
    expectTypeOf(nonamePerson.infer).toEqualTypeOf<NonamePerson>()
})

it('should successfully parse a valid non-name person object', () => {
    NonamePerson.assert({ age: 12, nested: { pet: 'foo' } })
})

it('should fail to parse invalid non-name person objects', () => {
    expect(NonamePerson.is({ name: 12 })).toBe(false)
    expect(NonamePerson.is({ age: 12 })).toBe(false)
    expect(NonamePerson.is({})).toBe(false)
})
