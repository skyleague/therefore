import { $array, $boolean, $number, $ref, $string, $union } from '../../src/index.js'
import type { Node } from '../../src/lib/cst/node.js'
import { $const } from '../../src/lib/primitives/const/const.js'
import { $record } from '../../src/lib/primitives/record/record.js'

export const json: Node = $union([
    $string,
    $const(null),
    $boolean,
    $number,
    $record($ref(() => json)),
    $array($ref(() => json)),
]).validator({
    assert: false,
})

export const jsonAdv: Node = $ref(() =>
    $union([$string, $const(null), $boolean, $number, $record($ref(() => jsonAdv)), $array($ref(() => jsonAdv))], {
        name: 'jsonLocal',
    }),
).validator()
