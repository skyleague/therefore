/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import { Ajv } from 'ajv'
import type { DefinedError } from 'ajv'

import CartItemSchema from './schemas/cart-item.schema.json' with { type: 'json' }

export const CartItem = {
    validate: new Ajv({
        strict: true,
        strictSchema: false,
        strictTypes: true,
        strictTuples: false,
        useDefaults: true,
        logger: false,
        loopRequired: 5,
        loopEnum: 5,
        multipleOfPrecision: 4,
        code: { esm: true },
    }).compile<CartItem>(CartItemSchema),
    schema: CartItemSchema,
    get errors() {
        return CartItem.validate.errors ?? undefined
    },
    is: (o: unknown): o is CartItem => CartItem.validate(o) === true,
    parse: (o: unknown): { right: CartItem } | { left: DefinedError[] } => {
        if (CartItem.is(o)) {
            return { right: o }
        }
        return { left: (CartItem.errors ?? []) as DefinedError[] }
    },
} as const

export interface CartItem {
    id: string
    name: string
    price: number
    size?: Size | undefined
}

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'
