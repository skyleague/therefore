import { expectTypeOf, it } from 'vitest'
import type { ObjectType } from '../../src/lib/primitives/object/object.js'
import type { OptionalType } from '../../src/lib/primitives/optional/optional.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import type { StringType } from '../../src/lib/primitives/string/string.js'
import { Foo } from './ref.type.js'

it('maps the types correctly', () => {
    expectTypeOf($ref(Foo)).toEqualTypeOf<
        ObjectType<{
            foo: OptionalType<
                ObjectType<{
                    bar: OptionalType<StringType>
                }>
            >
        }>
    >()
})
