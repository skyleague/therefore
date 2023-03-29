import { $integer } from './index.js'

test('function', () => {
    expect($integer).toMatchInlineSnapshot(`[Function]`)
})

test('multipleOf', () => {
    expect(
        $integer({
            multipleOf: 0.01,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "integer",
          "uuid": "0001-000",
          "value": {
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
        {
          "description": {},
          "type": "integer",
          "uuid": "0001-000",
          "value": {
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
        {
          "description": {},
          "type": "integer",
          "uuid": "0001-000",
          "value": {
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
        {
          "description": {},
          "type": "integer",
          "uuid": "0001-000",
          "value": {
            "maximum": 100,
            "minimum": 100,
            "multipleOf": 0.01,
          },
        }
    `)
})
