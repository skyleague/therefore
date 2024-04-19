import { episode } from './episode.schema.js'

import { $object } from '../../../../src/lib/primitives/object/object.js'
import { $string } from '../../../../src/lib/primitives/string/string.js'

export const characterArgs = $object({ id: $string }).describe('The id of the character')

export const heroArgs = $object({
    episode: episode
        .reference()
        .describe('If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode.'),
})
