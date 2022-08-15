# JSON format example
The schema definition for a valid JSON object is not the simplest per se. However, it gives us a good chance
to see a variety of different methods that are used in Therefore.

## Requirements
In this example we define a schema that should translate roughly to:

```ts
type Json =
    | string
    | null
    | boolean
    | number
    | Record<string, Json | undefined>
    | Json[]
```

## Method I
First we will use a very straightforward method to define the schema directly. Like typescript, Therefore also has union types.
Luckily for us, this means that we can redefined the typescript union almost directly to a Therefore union:

**json.schema.ts**
```ts
import { $array, $boolean, $dict, $null, $number, $ref, $string, $union } from '@zefiros-software/therefore'

export const json = $union([
    $string,
    $null,
    $boolean,
    $number,
    $dict($ref({ json: () => json })),
    $array($ref({ json: () => json })),
])
```

Normally a `$ref` statement can use a direct `Record<string, ThereforeType>` definition. In this case however, we use a recursive type 
making this not valid typescript. Therefore explicitly allows lambdas in this case to circumvent circular references of this kind. Note
that there may be limitations in Ajv to validate against these type of objects.

Now we run Therefore with `therefore -d .`, which gives us two new files: `json.type.ts` and `schemas/json.schema.json`:

**json.type.ts**
```ts
import jsonSchema from './schemas/json.schema.json'

import AjvValidator from 'ajv'

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
    schema: jsonSchema,
    validate: new AjvValidator().compile<Json>(jsonSchema),
    is: (o: unknown): o is Json => Json.validate(o) === true,
    assert: (o: unknown): asserts o is Json => {
        if (!Json.validate(o)) {
            throw new AjvValidator.ValidationError(Json.validate.errors ?? [])
        }
    },
}
```

**schemas/json.schema.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "oneOf": [
    {
      "type": "string"
    },
    {
      "type": "null"
    },
    {
      "type": "boolean"
    },
    {
      "type": "number"
    },
    {
      "type": "object",
      "additionalProperties": {
        "$ref": "#"
      }
    },
    {
      "type": "array",
      "items": {
        "$ref": "#"
      }
    }
  ]
}

```

## Method II
The second method we use `$ref` to generate a cleaner JSON Schema. The disadvantage of this method is that
is harder to read, and harder to parse for typescript, resulting in a hard requirement in defining the `RefType`
type on the schema.

```ts
import { $array, $boolean, $dict, $null, $number, $ref, $string, $union, RefType } from '@zefiros-software/therefore'

export const jsonAdv: RefType = $ref({
    jsonRef: () =>
        $union([
            $string,
            $null,
            $boolean,
            $number,
            $dict($ref({ jsonRef: () => jsonAdv })),
            $array($ref({ jsonRef: () => jsonAdv })),
        ]),
})
```

After generating the schemas again with `therefore -d .` we get:

**json.type.ts**
```ts
import jsonAdvSchema from './schemas/json-adv.schema.json'

export type JsonAdv = JsonRefLocal

export const JsonAdv = {
    schema: jsonAdvSchema,
    validate: new AjvValidator().compile<JsonAdv>(jsonAdvSchema),
    is: (o: unknown): o is JsonAdv => JsonAdv.validate(o) === true,
    assert: (o: unknown): asserts o is JsonAdv => {
        if (!JsonAdv.validate(o)) {
            throw new AjvValidator.ValidationError(JsonAdv.validate.errors ?? [])
        }
    },
}

type JsonRefLocal =
    | string
    | null
    | boolean
    | number
    | {
          [k: string]: JsonAdv | undefined
      }
    | JsonAdv[]
```

**schemas/json-adv.schema.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/JsonRefLocal",
  "definitions": {
    "JsonRefLocal": {
      "oneOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        },
        {
          "type": "boolean"
        },
        {
          "type": "number"
        },
        {
          "type": "object",
          "additionalProperties": {
            "$ref": "#"
          }
        },
        {
          "type": "array",
          "items": {
            "$ref": "#"
          }
        }
      ]
    }
  }
}

```