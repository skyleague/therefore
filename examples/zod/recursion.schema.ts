import type { Node } from '../../src/lib/cst/node.js'
import { $array } from '../../src/lib/primitives/array/array.js'
import { $object } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'

export const recursion: Node = $array($ref(() => recursion)).validator({ type: 'zod/v4' })

export const recursionObject: Node = $object({
    recursion: $array($ref(() => recursionObject)),
}).validator({ type: 'zod/v4' })

export const recursionValidator: Node = $array($ref(() => recursionValidator)).validator({ type: 'zod/v4' })

export const recursionObjectAdvanced: Node = $object({
    recursion: $array($ref(() => recursionObjectAdvanced)),
}).validator({ type: 'zod/v4' })
