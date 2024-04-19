import { $optional } from '../../src/lib/primitives/optional/optional.js'
import { $string } from '../../src/lib/primitives/string/string.js'
import { $unknown } from '../../src/lib/primitives/unknown/unknown.js'

export const optionalString = $optional($string)
export const optionalUnknown = $optional($unknown)

export const original = $string()
export const madeOptionalRef = $optional(original)
