import { $array, $number, $ref, $union, $validator } from '../../src'
import type { ThereforeCst } from '../../src/lib/primitives/types'

export const simple: ThereforeCst = $validator($union([$number, $array($ref(() => simple))]))

export default {
    simple,
}
