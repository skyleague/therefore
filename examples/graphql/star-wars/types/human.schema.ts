import { character } from './character.schema.js'

import { $graphql } from '../../../../src/lib/primitives/graphql/graphql.js'
import { $optional } from '../../../../src/lib/primitives/optional/optional.js'
import { $string } from '../../../../src/lib/primitives/string/string.js'

export const human = character.extend({}).describe('A humanoid creature in the Star Wars universe.')

export const homePlanetResolver = $graphql
    .resolver(human, 'homePlanet', {
        type: $optional($string()),
    })
    .describe('The home planet of the human, or null if unknown.')
