import { describe, expect, it } from 'vitest'
import type { Operation } from '../../../types/openapi.type.js'
import { methodName } from './builder.js'

describe('method name', () => {
    it('name from operation id', () => {
        expect(methodName('/', 'get', { operationId: 'fooBar' } as Operation)).toMatchInlineSnapshot(`"fooBar"`)
    })

    it('name from simple path', () => {
        expect(methodName('/foobar', 'get', {} as Operation)).toMatchInlineSnapshot(`"getFoobar"`)
    })

    it('name from simple paths', () => {
        expect(methodName('/foobar/users', 'get', {} as Operation)).toMatchInlineSnapshot(`"getFoobarUsers"`)
    })

    it('name from path parameters', () => {
        expect(methodName('/foobar/users/{userId}', 'get', {} as Operation)).toMatchInlineSnapshot(`"getFoobarUserByUserId"`)
    })

    it('singularize parameterized paths', () => {
        expect(methodName('/users/{userId}/events', 'get', {} as Operation)).toMatchInlineSnapshot(`"getUserEvents"`)
    })

    it('simplify path on mutation', () => {
        expect(methodName('/users/{userId}/events', 'post', {} as Operation)).toMatchInlineSnapshot(`"createUserEvent"`)
    })

    it('use suffix if last part is parameterized', () => {
        expect(methodName('/users/{userId}/events/{eventId}', 'post', {} as Operation)).toMatchInlineSnapshot(
            `"createUserEventByEventId"`,
        )
    })

    it('use action instead of method type', () => {
        expect(methodName('/users/{userId}/events/{eventId}:terminate', 'post', {} as Operation)).toMatchInlineSnapshot(
            `"terminateUserEvent"`,
        )
    })

    it('make distinction', () => {
        expect(methodName('/info.0.json', 'post', {} as Operation)).toMatchInlineSnapshot(`"createInfo0Json"`)
        expect(methodName('/{comicId}/info.0.json', 'post', {} as Operation)).toMatchInlineSnapshot(`"createInfo0JsonByComicId"`)
    })

    it('two following parameters', () => {
        expect(methodName('/api/projects/{id}{.format}', 'post', {} as Operation)).toMatchInlineSnapshot(
            `"createApiProjectByFormat"`,
        )
    })
})
