import { $number, $ref, $union } from '../../src/index.js'
import type { Node } from '../../src/lib/cst/node.js'

export const simple: Node = $union([$number, $ref(() => simple).array()]).validator()

export default {
    simple,
}
