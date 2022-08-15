import { $array } from '../../src/lib/primitives/array'
import { $string } from '../../src/lib/primitives/string'
import { $union } from '../../src/lib/primitives/union'

export const plugin = $union([$array($string, { default: ['none'] })], {
    name: 'plugin',
    description: 'Specify the npm plugins that should be loaded. Omit to load all installed plugins.',
})
