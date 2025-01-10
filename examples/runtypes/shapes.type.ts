/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as CircleValidator } from './schemas/circle.schema.js'
import { validate as RectangleValidator } from './schemas/rectangle.schema.js'
import { validate as ShapeValidator } from './schemas/shape.schema.js'
import { validate as SquareValidator } from './schemas/square.schema.js'

export const Circle = {
    validate: CircleValidator as ValidateFunction<Circle>,
    get schema() {
        return Circle.validate.schema
    },
    get errors() {
        return Circle.validate.errors ?? undefined
    },
    is: (o: unknown): o is Circle => Circle.validate(o) === true,
    parse: (o: unknown): { right: Circle } | { left: DefinedError[] } => {
        if (Circle.is(o)) {
            return { right: o }
        }
        return { left: (Circle.errors ?? []) as DefinedError[] }
    },
} as const

export interface Circle {
    radius: number
}

export const Rectangle = {
    validate: RectangleValidator as ValidateFunction<Rectangle>,
    get schema() {
        return Rectangle.validate.schema
    },
    get errors() {
        return Rectangle.validate.errors ?? undefined
    },
    is: (o: unknown): o is Rectangle => Rectangle.validate(o) === true,
    parse: (o: unknown): { right: Rectangle } | { left: DefinedError[] } => {
        if (Rectangle.is(o)) {
            return { right: o }
        }
        return { left: (Rectangle.errors ?? []) as DefinedError[] }
    },
} as const

export interface Rectangle {
    width: number
    height: number
}

export const Shape = {
    validate: ShapeValidator as ValidateFunction<Shape>,
    get schema() {
        return Shape.validate.schema
    },
    get errors() {
        return Shape.validate.errors ?? undefined
    },
    is: (o: unknown): o is Shape => Shape.validate(o) === true,
    parse: (o: unknown): { right: Shape } | { left: DefinedError[] } => {
        if (Shape.is(o)) {
            return { right: o }
        }
        return { left: (Shape.errors ?? []) as DefinedError[] }
    },
} as const

export type Shape = Square | Rectangle | Circle

export const Square = {
    validate: SquareValidator as ValidateFunction<Square>,
    get schema() {
        return Square.validate.schema
    },
    get errors() {
        return Square.validate.errors ?? undefined
    },
    is: (o: unknown): o is Square => Square.validate(o) === true,
    parse: (o: unknown): { right: Square } | { left: DefinedError[] } => {
        if (Square.is(o)) {
            return { right: o }
        }
        return { left: (Square.errors ?? []) as DefinedError[] }
    },
} as const

export interface Square {
    size: number
}
