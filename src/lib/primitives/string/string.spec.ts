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
        Object {
          "description": Object {},
          "type": "string",
          "uuid": "0001-000",
          "value": Object {
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
        Object {
          "description": Object {},
          "type": "string",
          "uuid": "0001-000",
          "value": Object {
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
        Object {
          "description": Object {},
          "type": "string",
          "uuid": "0001-000",
          "value": Object {
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
        Object {
          "description": Object {},
          "type": "string",
          "uuid": "0001-000",
          "value": Object {
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
        Object {
          "description": Object {},
          "type": "string",
          "uuid": "0001-000",
          "value": Object {
            "maxLength": 2,
            "minLength": 2,
            "pattern": /foo/,
          },
        }
    `)
})
