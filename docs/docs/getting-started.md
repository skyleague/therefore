---
sidebar_position: 10
title: Getting Started
---

# Getting Started

## Shopping Cart

Shopping carts are an integral part of many e-commerce websites and applications, allowing users to select and purchase products from an online store. As a result, it's important to have a clear and well-defined data model for representing shopping cart information in your code.

TypeScript interfaces are a powerful way to describe the shape of an object, specifying the structure and types of its properties. This makes it easy to ensure that your code consistently works with the correct data types and structure, reducing the likelihood of errors and making it easier to maintain and extend your codebase.

### Schema Definitions

For example, let's say that you are building an online store and you want to define a shopping cart data model in TypeScript. You might start with a simple `CartItem` schema that looks like this:

```ts title="./src/item.schema.ts"
import { $object, $string, $ref, $number, $enum, $optional, $validator } from '@skyleague/therefore'

export const size = $enum(['XS', 'S', 'M', 'L', 'XL'])

export const cartItem = $validator(
    $object({
        id: $string,
        name: $string,
        price: $number,
        size: $optional($ref(size)),
    })
)
```

This `CartItem` schema has four properties: `id`, `name`, `size`, and `price`. The `id` property is a number that uniquely identifies the item, the `name` property is a string that represents the name of the item, the size property shows the size of the item when defined, and the `price` property is a number that represents the price of a single unit of the item.

Next, you might define a `Cart` interface to represent the actual shopping cart:

```ts title="./src/cart.schema.ts"
import { cartItem } from './item.schema'

import { $object, $string, $ref, $array, $validator } from '@skyleague/therefore'

export const cart = $validator(
    $object({
        items: $array($ref(cartItem)),
        createdAt: $string({ format: 'date-time' }),
        updatedAt: $string({ format: 'date-time' }),
    })
)
```

With these two schemas, you can now use Therefore to define the shopping cart data in a consistent and well-structured way.

### Compilation

Running Therefore is easy. We just point the CLI to the directory where the schemas are stored:

```bash
$ npx therefore -f src

scanning src/cart.schema.ts
 - found Cart
scanning src/item.schema.ts
 - found CartItem
```

After which we get a few new files:

-   `cart.type.ts`
-   `item.type.ts`
-   `schemas/cart-item.schema.js`
-   `schemas/cart.schema.js`

The `type.ts` files are the compiled Typescript types that Therefore generated for us, and the schemas folder contains all the compiled AJV validation code.

### Types

As part of the output we get two files that contain the Typescript definition of our models.

```ts title="./src/item.schema.ts"
import type { ValidateFunction } from 'ajv'

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'

export interface CartItem {
    id: string
    name: string
    price: number
    size?: Size
}

export const CarItem = {
    validate: require('./schemas/item.schema.js') as ValidateFunction<Item>,
    get schema() {
        return Item.validate.schema
    },
    get errors() {
        return Item.validate.errors ?? undefined
    },
    is: (o: unknown): o is Item => Item.validate(o) === true,
    assert: (o: unknown) => {
        if (!Item.validate(o)) {
            throw new AjvValidator.ValidationError(Item.errors ?? [])
        }
    },
} as const
```

```ts title="./src/cart.type.ts"
import AjvValidator from 'ajv'
import type { ValidateFunction } from 'ajv'
import { Item } from './item.type'

export interface Cart {
    id: string
    items: CartItem[]
    createdAt: string
    updatedAt: string
}

export const Cart = {
    validate: require('./schemas/cart.schema.js') as ValidateFunction<Cart>,
    get schema() {
        return Cart.validate.schema
    },
    get errors() {
        return Cart.validate.errors ?? undefined
    },
    is: (o: unknown): o is Cart => Cart.validate(o) === true,
    assert: (o: unknown) => {
        if (!Cart.validate(o)) {
            throw new AjvValidator.ValidationError(Cart.errors ?? [])
        }
    },
} as const
```

With these compiled schemas we can validate unknown input, get JSON Schemas, guard logic from faulty input and throw errors when the data doesn't match the schema:

```ts
const data: unknown = JSON.parse('./cart.json')
if (Cart.is(data)) {
    console.log(`We've found a happy new cart! ${cart.id}`)
}
```

In summary, using Therefore schemas is a powerful way to model data in your code. By defining clear and well-structured schemas, you can ensure that your code consistently works with the correct data types and structure, making it easier to maintain and extend your codebase. Try it out in your next project and see how it can help you!
