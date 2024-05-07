import { $object } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { days, ref1 } from './locals.schema.js'

export const other = $ref(ref1)
export const refDays = $ref(days)

export const autorefOther = $object({ ref: ref1 })
export const autorefDays = $object({ ref: days })
