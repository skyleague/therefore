/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import AjvValidator from 'ajv'
import type { ValidateFunction } from 'ajv'

export interface Square {
    size: number
}

export const Square = {
    validate: require('./schemas/square.schema.js') as ValidateFunction<Square>,
    get schema() {
        return Square.validate.schema
    },
    get errors() {
        return Square.validate.errors ?? undefined
    },
    is: (o: unknown): o is Square => Square.validate(o) === true,
    assert: (o: unknown) => {
        if (!Square.validate(o)) {
            throw new AjvValidator.ValidationError(Square.errors ?? [])
        }
    },
} as const

export interface Rectangle {
    width: number
    height: number
}

export const Rectangle = {
    validate: require('./schemas/rectangle.schema.js') as ValidateFunction<Rectangle>,
    get schema() {
        return Rectangle.validate.schema
    },
    get errors() {
        return Rectangle.validate.errors ?? undefined
    },
    is: (o: unknown): o is Rectangle => Rectangle.validate(o) === true,
    assert: (o: unknown) => {
        if (!Rectangle.validate(o)) {
            throw new AjvValidator.ValidationError(Rectangle.errors ?? [])
        }
    },
} as const

export interface Circle {
    radius: number
}

export const Circle = {
    validate: require('./schemas/circle.schema.js') as ValidateFunction<Circle>,
    get schema() {
        return Circle.validate.schema
    },
    get errors() {
        return Circle.validate.errors ?? undefined
    },
    is: (o: unknown): o is Circle => Circle.validate(o) === true,
    assert: (o: unknown) => {
        if (!Circle.validate(o)) {
            throw new AjvValidator.ValidationError(Circle.errors ?? [])
        }
    },
} as const

export type Shape = Square | Rectangle | Circle

export const Shape = {
    validate: require('./schemas/shape.schema.js') as ValidateFunction<Shape>,
    get schema() {
        return Shape.validate.schema
    },
    get errors() {
        return Shape.validate.errors ?? undefined
    },
    is: (o: unknown): o is Shape => Shape.validate(o) === true,
    assert: (o: unknown) => {
        if (!Shape.validate(o)) {
            throw new AjvValidator.ValidationError(Shape.errors ?? [])
        }
    },
} as const
