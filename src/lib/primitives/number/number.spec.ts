import { $number } from '.'

test('function', () => {
    expect($number).toMatchInlineSnapshot(`[Function]`)
})

test('multipleOf', () => {
    expect(
        $number({
            multipleOf: 0.01,
        })
    ).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "number",
          "uuid": "0001-000",
          "value": Object {
            "multipleOf": 0.01,
          },
        }
    `)
})

test('maximum', () => {
    expect(
        $number({
            maximum: 100,
        })
    ).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "number",
          "uuid": "0001-000",
          "value": Object {
            "maximum": 100,
          },
        }
    `)
})

test('minimum', () => {
    expect(
        $number({
            minimum: 100,
        })
    ).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "number",
          "uuid": "0001-000",
          "value": Object {
            "minimum": 100,
          },
        }
    `)
})

test('combined', () => {
    expect(
        $number({
            multipleOf: 0.01,
            maximum: 100,
            minimum: 100,
        })
    ).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "number",
          "uuid": "0001-000",
          "value": Object {
            "maximum": 100,
            "minimum": 100,
            "multipleOf": 0.01,
          },
        }
    `)
})
