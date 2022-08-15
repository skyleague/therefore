import { $array, $boolean, $dict, $null, $number, $ref, $string, $union, $validator } from '../../src'

export const json = $validator($union([$string, $null, $boolean, $number, $dict($ref(() => json)), $array($ref(() => json))]))

export const jsonAdv = $validator(
    $ref(() =>
        $union([$string, $null, $boolean, $number, $dict($ref(() => jsonAdv)), $array($ref(() => jsonAdv))], {
            name: 'jsonLocal',
        })
    )
)
