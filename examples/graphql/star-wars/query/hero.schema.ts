import { $graphql } from '../../../../src/lib/primitives/graphql/graphql.js'
import { character } from '../types/character.schema.js'
import { droid } from '../types/droid.schema.js'
import { human } from '../types/human.schema.js'
import { characterArgs, heroArgs } from '../types/input.schema.js'

export const heroField = $graphql.field({ type: character.reference(), args: { input: heroArgs.reference() } })

export const humanField = $graphql.field({ type: human.reference(), args: characterArgs })

export const droidField = $graphql.field({ type: droid.reference(), args: characterArgs })
