import { episode } from './episode.schema.js'
import { characterArgs } from './input.schema.js'

import { $array } from '../../../../src/lib/primitives/array/array.js'
import { $graphql } from '../../../../src/lib/primitives/graphql/graphql.js'
import { $object } from '../../../../src/lib/primitives/object/object.js'
import { $string } from '../../../../src/lib/primitives/string/string.js'

export const character = $object({
    id: $string().describe('The id of the character'),
    name: $string().describe('The name of the character'),
})

export const friendsResolver = $graphql
    .resolver(character, 'friends', {
        type: $array(character.reference()).describe('The friends of the character, or an empty list if they have none.'),
    })
    .describe('The friends of the character, or an empty list if they have none.')

export const appearsInResolver = $graphql
    .resolver(character, 'appearsIn', {
        args: characterArgs,
        type: episode.reference().array(),
    })
    .describe('Which movies they appear in.')
