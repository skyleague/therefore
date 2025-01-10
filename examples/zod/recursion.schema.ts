import {} from '../../src/index.js'
import type { Node } from '../../src/lib/cst/node.js'
import { $array } from '../../src/lib/primitives/array/array.js'
import { $object } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'

export const recursion: Node = (() => {
    const node = $array($ref(() => recursion))
    node._attributes.validator = 'zod'
    return node
})()

export const recursionObject: Node = (() => {
    const node = $object({
        recursion: $array($ref(() => recursionObject)),
    })
    node._attributes.validator = 'zod'
    return node
})()

export const recursionValidator: Node = (() => {
    const node = $array($ref(() => recursionValidator)).validator()
    node._attributes.validator = 'zod'
    return node
})()

export const recursionObjectAdvanced: Node = (() => {
    const node = $object({
        recursion: $array($ref(() => recursionObjectAdvanced)),
    })
    node._attributes.validator = 'zod'
    return node
})()
