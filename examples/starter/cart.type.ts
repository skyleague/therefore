/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
/* eslint-disable */

import type { CartItem } from './item.type.js'
import { validate as CartValidator } from './schemas/cart.schema.js'

import type { DefinedError, ValidateFunction } from 'ajv'

export interface Cart {
    id: string
    items: CartItem[]
    createdAt: string
    updatedAt: string
}

export const Cart = {
    validate: CartValidator as ValidateFunction<Cart>,
    get schema() {
        return Cart.validate.schema
    },
    get errors() {
        return Cart.validate.errors ?? undefined
    },
    is: (o: unknown): o is Cart => Cart.validate(o) === true,
    parse: (o: unknown): { right: Cart } | { left: DefinedError[] } => {
        if (Cart.is(o)) {
            return { right: o }
        }
        return { left: (Cart.errors ?? []) as DefinedError[] }
    },
} as const
