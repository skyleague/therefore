import { $array, $boolean, $dict, $null, $number, $ref, $string, $union, $validator } from '../../src/index.js'
import type { ThereforeSchema } from '../../src/lib/primitives/types.js'

export const json: ThereforeSchema = $validator(
    $union([$string, $null, $boolean, $number, $dict($ref(() => json)), $array($ref(() => json))]),
    {
        assert: false,
    }
)

export const jsonAdv: ThereforeSchema = $validator(
    $ref(() =>
        $union([$string, $null, $boolean, $number, $dict($ref(() => jsonAdv)), $array($ref(() => jsonAdv))], {
            name: 'jsonLocal',
        })
    )
)
