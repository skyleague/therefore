import { $array, $number, $ref, $union, $validator } from '../../src'

export const simple = $validator($union([$number, $array($ref(() => simple))]))

export default {
    simple,
}
