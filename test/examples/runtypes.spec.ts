import { forAll } from '@skyleague/axioms'
import { expect, it } from 'vitest'
import { SpaceObject } from '../../examples/runtypes/game.type.js'
import { Circle, Rectangle, Shape, Square } from '../../examples/runtypes/shapes.type.js'
import { compileOutput } from '../../src/commands/generate/generate.js'
import { arbitrary } from '../../src/lib/visitor/arbitrary/arbitrary.js'

it('output generation', async () => {
    expect(
        await compileOutput(['examples/runtypes/game.schema.ts', 'examples/runtypes/shapes.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('SpaceObject', () => {
    forAll(arbitrary(SpaceObject), (x) => SpaceObject.is(x))
})

it('Circle', () => {
    forAll(arbitrary(Circle), (x) => Circle.is(x))
})

it('Rectangle', () => {
    forAll(arbitrary(Rectangle), (x) => Rectangle.is(x))
})

it('Shape', () => {
    forAll(arbitrary(Shape), (x) => Shape.is(x))
})

it('Square', () => {
    forAll(arbitrary(Square), (x) => Square.is(x))
})
