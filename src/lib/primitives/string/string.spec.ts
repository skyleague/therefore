import { $string } from '.'

test('function', () => {
    expect($string).toMatchInlineSnapshot(`[Function]`)
})

test('minLength', () => {
    expect(
        $string({
            minLength: 2,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "minLength": 2,
          },
        }
    `)
})

test('maxLength', () => {
    expect(
        $string({
            maxLength: 2,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "maxLength": 2,
          },
        }
    `)
})

test('pattern', () => {
    expect(
        $string({
            pattern: /foo/,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "pattern": /foo/,
          },
        }
    `)
})

test('format', () => {
    expect(
        $string({
            format: 'date',
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "format": "date",
          },
        }
    `)
})

test('all', () => {
    expect(
        $string({
            minLength: 2,
            maxLength: 2,
            pattern: /foo/,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "maxLength": 2,
            "minLength": 2,
            "pattern": /foo/,
          },
        }
    `)
})
