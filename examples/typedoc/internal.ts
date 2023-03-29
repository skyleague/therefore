import { $array } from '../../src/lib/primitives/array/index.js'
import { $string } from '../../src/lib/primitives/string/index.js'
import { $union } from '../../src/lib/primitives/union/index.js'

export const plugin = $union([$array($string, { default: ['none'] })], {
    name: 'plugin',
    description: 'Specify the npm plugins that should be loaded. Omit to load all installed plugins.',
})
