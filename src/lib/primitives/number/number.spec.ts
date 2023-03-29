import { $number } from './index.js'

test('function', () => {
    expect($number).toMatchInlineSnapshot(`[Function]`)
})

test('multipleOf', () => {
    expect(
        $number({
            multipleOf: 0.01,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "number",
          "uuid": "0001-000",
          "value": {
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
        {
          "description": {},
          "type": "number",
          "uuid": "0001-000",
          "value": {
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
        {
          "description": {},
          "type": "number",
          "uuid": "0001-000",
          "value": {
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
        {
          "description": {},
          "type": "number",
          "uuid": "0001-000",
          "value": {
            "maximum": 100,
            "minimum": 100,
            "multipleOf": 0.01,
          },
        }
    `)
})
