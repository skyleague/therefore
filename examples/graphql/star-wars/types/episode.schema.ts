import { $enum } from '../../../../src/lib/primitives/enum/enum.js'
import { $union } from '../../../../src/lib/primitives/union/union.js'

export const episode = $enum(['NEWHOPE', 'EMPIRE', 'JEDI']).describe('One of the films in the Star Wars Trilogy')

export const moreEpisodes = $union([episode.reference(), $enum(['OTHER'])])
