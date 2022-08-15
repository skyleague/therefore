import type { Shape } from './shapes.type'
import { Rectangle, Square } from './shapes.type'

export function area(shape: Shape): number {
    if (Square.is(shape)) {
        return Math.pow(shape.size, 2)
    } else if (Rectangle.is(shape)) {
        return shape.height * shape.width
    } else {
        return Math.PI * Math.pow(shape.radius, 2)
    }
}
