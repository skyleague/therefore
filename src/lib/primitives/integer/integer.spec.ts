import { $integer } from '.'

test('function', () => {
    expect($integer).toMatchInlineSnapshot(`[Function]`)
})

test('multipleOf', () => {
    expect(
        $integer({
            multipleOf: 0.01,
        })
    ).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "integer",
          "uuid": "0001-000",
          "value": Object {
            "multipleOf": 0.01,
          },
        }
    `)
})

test('maximum', () => {
    expect(
        $integer({
            maximum: 100,
        })
    ).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "integer",
          "uuid": "0001-000",
          "value": Object {
            "maximum": 100,
          },
        }
    `)
})

test('minimum', () => {
    expect(
        $integer({
            minimum: 100,
        })
    ).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "integer",
          "uuid": "0001-000",
          "value": Object {
            "minimum": 100,
          },
        }
    `)
})

test('combined', () => {
    expect(
        $integer({
            multipleOf: 0.01,
            maximum: 100,
            minimum: 100,
        })
    ).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "integer",
          "uuid": "0001-000",
          "value": Object {
            "maximum": 100,
            "minimum": 100,
            "multipleOf": 0.01,
          },
        }
    `)
})
