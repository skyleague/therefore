import { JSDoc } from './jsdoc.js'

import { array, boolean, forAll, json, object, string, tuple } from '@skyleague/axioms'
import { expect, it } from 'vitest'

it('description', () => {
    expect(JSDoc.from({ key: 'foo', definition: { description: 'lorum ipsum' } })).toMatchInlineSnapshot(`
            "/**
             * lorum ipsum
             */
            "
        `)
})

it('summary', () => {
    expect(JSDoc.from({ key: 'foo', definition: { summary: 'lorum ipsum' } })).toMatchInlineSnapshot(`
            "/**
             * lorum ipsum
             */
            "
        `)
})

it('examples', () => {
    expect(JSDoc.from({ key: 'foo', definition: { examples: [] } })).toMatchInlineSnapshot('undefined')
    expect(
        JSDoc.from({
            key: 'foo',
            definition: {
                examples: ['lorum ipsum', 'dolor sit amet'],
            },
        }),
    ).toMatchInlineSnapshot(`
            "/**
             * @example foo = 'lorum ipsum'
             * @example foo = 'dolor sit amet'
             */
            "
        `)
})

it('default', () => {
    expect(JSDoc.from({ key: 'foo', definition: { default: [] } })).toMatchInlineSnapshot(`
            "/**
             * @default []
             */
            "
        `)
    expect(JSDoc.from({ key: 'foo', definition: { default: 'lorum ipsum' } })).toMatchInlineSnapshot(`
            "/**
             * @default 'lorum ipsum'
             */
            "
        `)
})

it('combined', () => {
    expect(
        JSDoc.from({
            key: 'foo',
            definition: {
                description: 'lorum ipsum',
                default: 'dolor sit amet',
                examples: ['lorum ipsum', 'dolor sit amet'],
                deprecated: true,
            },
        }),
    ).toMatchInlineSnapshot(`
        "/**
         * lorum ipsum
         * 
         * @default 'dolor sit amet'
         * @deprecated
         * 
         * @example foo = 'lorum ipsum'
         * @example foo = 'dolor sit amet'
         */
        "
    `)
})

it('jsdoc is always valid javascript', () => {
    forAll(
        tuple(
            string(),
            object({
                description: string(),
                title: string(),
                default: json(),
                examples: array(json()),
                readonly: boolean(),
                deprecated: boolean(),
            }),
        ),
        ([key, { description, title, default: def, examples, readonly, deprecated }]) =>
            // biome-ignore lint/security/noGlobalEval: it's a test, we're okay with eval here
            eval(JSDoc.from({ key, definition: { description, title, default: def, examples, readonly, deprecated } }) ?? ''),
    )
})
