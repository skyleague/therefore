/* eslint-disable @typescript-eslint/no-unsafe-return */
import { toJSDoc } from './jsdoc'

import { array, boolean, forAll, json, object, string, tuple } from '@skyleague/axioms'

test('description', () => {
    expect(toJSDoc({ key: 'foo', meta: { description: 'lorum ipsum' } })).toMatchInlineSnapshot(`
            "/**
             * lorum ipsum
             */
            "
        `)
})

test('examples', () => {
    expect(toJSDoc({ key: 'foo', meta: { examples: [] } })).toMatchInlineSnapshot(`undefined`)
    expect(
        toJSDoc({
            key: 'foo',
            meta: {
                examples: ['lorum ipsum', 'dolor sit amet'],
            },
        })
    ).toMatchInlineSnapshot(`
            "/**
             * @example foo = 'lorum ipsum'
             * @example foo = 'dolor sit amet'
             */
            "
        `)
})

test('default', () => {
    expect(toJSDoc({ key: 'foo', meta: { default: [] } })).toMatchInlineSnapshot(`
            "/**
             * @default []
             */
            "
        `)
    expect(toJSDoc({ key: 'foo', meta: { default: 'lorum ipsum' } })).toMatchInlineSnapshot(`
            "/**
             * @default 'lorum ipsum'
             */
            "
        `)
})

test('combined', () => {
    expect(
        toJSDoc({
            key: 'foo',
            meta: {
                description: 'lorum ipsum',
                default: 'dolor sit amet',
                examples: ['lorum ipsum', 'dolor sit amet'],
                deprecated: true,
            },
        })
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

test('jsdoc is always valid javascript', () => {
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
            })
        ),
        ([key, { description, title, default: def, examples, readonly, deprecated }]) =>
            eval(toJSDoc({ key, meta: { description, title, default: def, examples, readonly, deprecated } }) ?? '')
    )
})
