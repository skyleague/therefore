import { character } from './character.schema.js'

import { $graphql } from '../../../../src/lib/primitives/graphql/graphql.js'
import { $string } from '../../../../src/lib/primitives/string/string.js'

export const droid = character.extend({}).describe('A mechanical creature in the Star Wars universe.')

export const primaryFunctionResolver = $graphql
    .resolver(droid, 'primaryFunction', {
        type: $string(),
    })
    .describe('The primary function of the droid.')
