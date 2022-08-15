import { $number, $object, $union, $enum, $tuple, $ref, $boolean, $string, $array, $dict, $const, $validator } from '../../src'

const nonNegative = $number({
    minimum: 0,
})

const vector = $tuple([$number, $number, $number], { name: 'vector' })

export const asteroid = $object({
    type: $const('asteroid'),
    location: $ref(vector),
    mass: nonNegative,
})

export const planet = $object({
    type: $const('planet'),
    location: $ref(vector),
    mass: nonNegative,
    population: nonNegative,
    habitable: $boolean,
})

export const rank = $enum(['captain', 'first mate', 'officer', 'ensign'])

export const crewMember = $object({
    name: $string,
    age: nonNegative,
    rank: $ref(rank),
    home: $ref(planet),
})

export const ship = $object({
    type: $const('ship'),
    location: $ref(vector),
    mass: nonNegative,
    name: $string,
    crew: $array($ref(crewMember)),
})

export const fleet = $dict($ref(ship))
export const spaceObject = $validator($union([$ref(asteroid), $ref(planet), $ref(ship)]))
