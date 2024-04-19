import type { Node } from '../../../src/lib/cst/node.js'
import { $array } from '../../../src/lib/primitives/array/array.js'
import { $boolean } from '../../../src/lib/primitives/boolean/boolean.js'
import { $const } from '../../../src/lib/primitives/const/const.js'
import { $enum } from '../../../src/lib/primitives/enum/enum.js'
import { $integer } from '../../../src/lib/primitives/integer/integer.js'
import { $intersection } from '../../../src/lib/primitives/intersection/intersection.js'
import { JSONObjectType } from '../../../src/lib/primitives/jsonschema/jsonschema.js'
import { $number } from '../../../src/lib/primitives/number/number.js'
import { $object } from '../../../src/lib/primitives/object/object.js'
import { $optional } from '../../../src/lib/primitives/optional/optional.js'
import { $ref } from '../../../src/lib/primitives/ref/ref.js'
import { $string } from '../../../src/lib/primitives/string/string.js'
import { $union } from '../../../src/lib/primitives/union/union.js'
import { $unknown } from '../../../src/lib/primitives/unknown/unknown.js'

// this is the definition of all supported therefore schema syntax
// it is used to validate the correctness of the schema
// and to generate arbitrary data

export const jsonAnnotations = $object({
    title: $optional($string),
    description: $optional($string),
    default: $optional($unknown({ restrictToJson: true }).arbitrary({ size: 'xs' })),
    deprecated: $optional($boolean),
    readonly: $optional($boolean),
    writeonly: $optional($boolean),
    examples: $optional($array($unknown({ restrictToJson: true }).arbitrary({ size: 'xs' })).arbitrary({ size: 'xs' })),
    nullable: $optional($boolean),
})

export const unknownInstance = $ref(jsonAnnotations)
export const enumInstance = $intersection([
    $object({
        // @todo named
        enum: $array($unknown({ restrictToJson: true }), { minItems: 1, set: true }).arbitrary({ size: 'xs' }),
    }),
    $ref(jsonAnnotations),
])

export const constInstance = $intersection([
    $object({
        const: $unknown({ restrictToJson: true }).arbitrary({ size: 'xs' }),
    }),
    $ref(jsonAnnotations),
])

export const booleanInstance = $intersection([
    $object({
        type: $const('boolean'),
    }),
    $ref(jsonAnnotations),
])

export const integerInstance = $intersection([
    $object({
        type: $const('integer'),
        multipleOf: $optional($integer().positive()),
    }),
    $union([$object({ minimum: $optional($number()) }), $object({ exclusiveMinimum: $optional($number()) })]),
    $union([$object({ maximum: $optional($number()) }), $object({ exclusiveMaximum: $optional($number()) })]),
    $ref(jsonAnnotations),
])

export const numberInstance = $intersection([
    $object({
        type: $const('number'),
        multipleOf: $optional($integer().positive()),
    }),
    $union([$object({ minimum: $optional($number()) }), $object({ exclusiveMinimum: $optional($number()) })]),
    $union([$object({ maximum: $optional($number()) }), $object({ exclusiveMaximum: $optional($number()) })]),
    $ref(jsonAnnotations),
])

export const stringInstance = $intersection([
    $object({
        type: $const('string'),
    }),
    $union([
        $object({
            minLength: $integer().nonnegative().arbitrary({ max: 100 }).optional(),
            maxLength: $integer().nonnegative().arbitrary({ max: 100 }).optional(),
        }),
        $object({
            format: $enum([
                'date-time',
                'date',
                'time',
                'email',
                'hostname',
                'ipv4',
                'ipv6',
                'uri',
                'uuid',
                // adds regex
                // 'ulid',
            ]),
        }),
        $object({
            // restrict this greatly
            pattern: $const('[a-zA-Z0-9]{2,10}'),
        }),
    ]),
    $ref(jsonAnnotations),
])

export const nullInstance = $intersection([
    $object({
        type: $const('null'),
    }),
    $ref(jsonAnnotations),
])

export const intersectionInstance = $intersection([
    $object({
        allOf: $array(
            $ref(() => objectInstance),
            { minItems: 1 },
        ).arbitrary({ maxLength: 2 }),
    }),
    $ref(jsonAnnotations),
])

export const unionInstance = $intersection([
    $object({
        anyOf: $array(
            $ref(() => jsonSchema),
            { minItems: 1 },
        ).arbitrary({ maxLength: 5 }),
    }),
    $ref(jsonAnnotations),
])

export const alternateXORUnionInstance = $intersection([
    $object({
        oneOf: $array(
            $ref(() => jsonSchema),
            { minItems: 1 },
        ).arbitrary({ maxLength: 1 }),
    }),
    $ref(jsonAnnotations),
])

// these definitions are horrible and should not exist
// but sometimes are used in openapi definitions
export const factoredSchema = $intersection([
    $ref(() => objectInstance),
    $union([$ref(() => unionInstance), $ref(() => alternateXORUnionInstance), $ref(() => intersectionInstance)]),
])

export const objectInstance = $intersection([
    $object({
        type: $const('object'),
        properties: new JSONObjectType({
            shape: {},
            // these will all be optional
            recordType: $ref(() => jsonSchema),
        }),
    }),
    $union([
        $object({
            patternProperties: new JSONObjectType({
                shape: {},
                patternProperties: { '[a-zA-Z0-9]{2,10}': $ref(() => jsonSchema) },
            }),
        }),
        $object({
            additionalProperties: $ref(() => jsonSchema),
        }),
    ]),
    $ref(jsonAnnotations),
])

export const arrayInstance = $intersection([
    $object({
        type: $const('array'),
        items: $ref(() => jsonSchema),
        minItems: $optional($integer().nonnegative().arbitrary({ max: 2 })),
        maxItems: $optional($integer().nonnegative().arbitrary({ max: 2 })),
        uniqueItems: $optional($boolean),
        'x-arbitrary': $const({
            maxLength: 2,
        }),
    }),
    $ref(jsonAnnotations),
])

export const tupleInstance = $intersection([
    $object({
        type: $const('array'),
        items: $array($ref(() => jsonSchema)).minItems(1),
        additionalItems: $const(false),
    }),
    $ref(jsonAnnotations),
])

export const variadicTupleInstance = $intersection([
    $object({
        type: $const('array'),
        items: $array($ref(() => jsonSchema)).minItems(1),
        // is only valid when there is an arra
        additionalItems: $ref(() => jsonSchema),
    }),
    $ref(jsonAnnotations),
])

export const alternativeType = $intersection([
    $object({
        type: $array($enum(['null', 'boolean', 'object', 'array', 'number', 'string']))
            .set()
            .minItems(1),
    }),
    $ref(jsonAnnotations),
])

export const refType = $intersection([
    $object({
        $ref: $string().arbitrary({ format: 'alpha', minLength: 1 }),
    }),
    // these are not allowed as per draft07 specification
    // https://json-schema.org/draft-07/draft-handrews-json-schema-01#rfc.section.8.3
    // $ref(jsonAnnotations),
])

export const jsonSchema: Node = $union([
    $ref(booleanInstance),
    $ref(unknownInstance),
    $ref(enumInstance),
    $ref(constInstance),
    $ref(integerInstance),
    $ref(numberInstance),
    $ref(stringInstance),
    // // null type is not a thing currentlyq
    $ref(nullInstance),
    $ref(objectInstance),
    $ref(arrayInstance),
    $ref(tupleInstance),
    $ref(variadicTupleInstance),
    $ref(unionInstance),
    $ref(intersectionInstance),

    $ref(refType),

    // alternative syntax
    $ref(alternateXORUnionInstance),
    $ref(alternativeType),
    // $ref(factoredSchema),
]).validator({ assert: true })
