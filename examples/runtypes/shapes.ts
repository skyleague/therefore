import type { Shape } from './shapes.type.js'
import { Rectangle, Square } from './shapes.type.js'

export function area(shape: Shape): number {
    if (Square.is(shape)) {
        return shape.size ** 2
    }
    if (Rectangle.is(shape)) {
        return shape.height * shape.width
    }
    return Math.PI * shape.radius ** 2
}
