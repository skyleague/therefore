import { methodName } from './restclient'

import type { Operation } from '../../../openapi.type'

describe('method name', () => {
    test('name from operation id', () => {
        expect(methodName('/', 'get', { operationId: 'fooBar' } as Operation)).toMatchInlineSnapshot(`"fooBar"`)
    })

    test('name from simple path', () => {
        expect(methodName('/foobar', 'get', {} as Operation)).toMatchInlineSnapshot(`"getFoobar"`)
    })

    test('name from simple paths', () => {
        expect(methodName('/foobar/users', 'get', {} as Operation)).toMatchInlineSnapshot(`"getFoobarUsers"`)
    })

    test('name from path parameters', () => {
        expect(methodName('/foobar/users/{userId}', 'get', {} as Operation)).toMatchInlineSnapshot(`"getFoobarUserByUserId"`)
    })

    test('singularize parameterized paths', () => {
        expect(methodName('/users/{userId}/events', 'get', {} as Operation)).toMatchInlineSnapshot(`"getUserEvents"`)
    })

    test('simplify path on mutation', () => {
        expect(methodName('/users/{userId}/events', 'post', {} as Operation)).toMatchInlineSnapshot(`"createUserEvent"`)
    })

    test('use suffix if last part is parameterized', () => {
        expect(methodName('/users/{userId}/events/{eventId}', 'post', {} as Operation)).toMatchInlineSnapshot(
            `"createUserEventByEventId"`
        )
    })

    test('use action instead of method type', () => {
        expect(methodName('/users/{userId}/events/{eventId}:terminate', 'post', {} as Operation)).toMatchInlineSnapshot(
            `"terminateUserEvent"`
        )
    })
})
