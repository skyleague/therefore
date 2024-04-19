import { $string } from '../../src/lib/primitives/string/index.js'
import { $union } from '../../src/lib/primitives/union/index.js'

export const plugin = $union([$string().array().default(['none'])], {
    name: 'plugin',
}).describe('Specify the npm plugins that should be loaded. Omit to load all installed plugins.')
