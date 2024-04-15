---
sidebar_position: 30
---

# Complex Types

One of the key features of Therefore is its support for complex data types with circular references.

## Circular References

One of such data types is a circular reference. Circular references occur when an object refers to itself or to another object that refers back to the original object, forming a loop. These can be challenging to deal with in data languages, as most language does not support circular references directly.

### JSON Type

An easy type that holds such a circular reference is the JSON data type. We'll provide two different methods that can be used to model such data:

```ts title="./src/json1.schema.ts"
export const json: ThereforeSchema = $validator(
    $union([$string, $null, $boolean, $number, $record($ref(() => json)), $array($ref(() => json))]),
    {
        assert: false,
    }
)
```

```ts title="./src/json1.type.ts"
export type Json =
    | string
    | null
    | boolean
    | number
    | {
          [k: string]: Json | undefined
      }
    | Json[]

export const Json = {
    validate: require('./schemas/json1.schema.js') as ValidateFunction<Json>,
    get schema() {
        return Json.validate.schema
    },
    get errors() {
        return Json.validate.errors ?? undefined
    },
    is: (o: unknown): o is Json => Json.validate(o) === true,
} as const
```

```ts title="./src/json2.schema.ts"
export const jsonAdv: ThereforeSchema = $validator(
    $ref(() =>
        $union([
            $string,
            $null,
            $boolean,
            $number,
            $record($ref(() => jsonAdv)),
            $array($ref(() => jsonAdv))
        ], {
            name: 'jsonLocal',
        })
    )
```

```ts title="./src/json2.type.ts"
export const JsonAdv = {
    validate: require('./schemas/json2.schema.js') as ValidateFunction<JsonAdv>,
    get schema() {
        return JsonAdv.validate.schema
    },
    get errors() {
        return JsonAdv.validate.errors ?? undefined
    },
    is: (o: unknown): o is JsonAdv => JsonAdv.validate(o) === true,
    assert: (o: unknown) => {
        if (!JsonAdv.validate(o)) {
            throw new AjvValidator.ValidationError(JsonAdv.errors ?? [])
        }
    },
} as const

type JsonLocal =
    | string
    | null
    | boolean
    | number
    | {
          [k: string]: JsonAdv | undefined
      }
    | JsonAdv[]
```
