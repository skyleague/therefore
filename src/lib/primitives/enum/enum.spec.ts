import { $enum } from '.'

test('function', () => {
    expect($enum).toMatchInlineSnapshot(`[Function]`)
})

test('values', () => {
    expect($enum([1, 2, 3, '4'])).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            1,
            2,
            3,
            "4",
          ],
          "description": Object {},
          "type": "enum",
          "uuid": "0001-000",
          "value": Object {},
        }
    `)
})

test('named', () => {
    expect(
        $enum({
            foo: 'bar',
            woo: 'baz',
        })
    ).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Array [
              "foo",
              "bar",
            ],
            Array [
              "woo",
              "baz",
            ],
          ],
          "description": Object {},
          "type": "enum",
          "uuid": "0001-000",
          "value": Object {},
        }
    `)
})
