import { $boolean, $const, $enum, $number, $object, $string, $tuple, $union } from '../../src/index.js'
import { $record } from '../../src/lib/primitives/record/record.js'

const nonNegative = $number().nonnegative()

const vector = $tuple([$number, $number, $number], { name: 'vector' })

export const asteroid = $object({
    type: $const('asteroid'),
    location: vector.reference(),
    mass: nonNegative,
})

export const planet = $object({
    type: $const('planet'),
    location: vector.reference(),
    mass: nonNegative,
    population: nonNegative,
    habitable: $boolean,
})

export const rank = $enum(['captain', 'first mate', 'officer', 'ensign'])

export const crewMember = $object({
    name: $string,
    age: nonNegative,
    rank: rank.reference(),
    home: planet.reference(),
})

export const ship = $object({
    type: $const('ship'),
    location: vector.reference(),
    mass: nonNegative,
    name: $string,
    crew: crewMember.reference().array(),
})

export const fleet = $record(ship.reference())
export const spaceObject = $union([asteroid.reference(), planet.reference(), ship.reference()]).validator()
