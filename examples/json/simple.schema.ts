import { $array, $number, $ref, $union, $validator } from '../../src/index.js'
import type { ThereforeCst } from '../../src/lib/primitives/types.js'

export const simple: ThereforeCst = $validator($union([$number, $array($ref(() => simple))]))

export default {
    simple,
}
