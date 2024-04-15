// https://github.com/graphql-nexus/nexus/tree/main/examples/star-wars/src/graphql

import { droidField, heroField, humanField } from './query/hero.schema.js'

import { $graphql } from '../../../src/lib/primitives/graphql/graphql.js'

export const schema = $graphql.schema({
    query: {
        hero: heroField,
        human: humanField,
        droid: droidField,
    },
})
