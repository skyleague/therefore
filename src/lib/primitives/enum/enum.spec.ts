import { $enum } from '.'

test('function', () => {
    expect($enum).toMatchInlineSnapshot(`[Function]`)
})

test('values', () => {
    expect($enum([1, 2, 3, '4'])).toMatchInlineSnapshot(`
        {
          "children": [
            1,
            2,
            3,
            "4",
          ],
          "description": {},
          "type": "enum",
          "uuid": "0001-000",
          "value": {},
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
        {
          "children": [
            [
              "foo",
              "bar",
            ],
            [
              "woo",
              "baz",
            ],
          ],
          "description": {},
          "type": "enum",
          "uuid": "0001-000",
          "value": {},
        }
    `)
})
