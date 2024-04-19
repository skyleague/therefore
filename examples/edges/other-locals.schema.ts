import { days, ref1 } from './locals.schema.js'

import { $ref } from '../../src/lib/primitives/ref/ref.js'

export const other = $ref(ref1)
export const refDays = $ref(days)
