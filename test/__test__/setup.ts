import { jest } from '@jest/globals'

global.jest = jest as typeof global.jest

jest.unstable_mockModule('uuid', () => ({ v4: mockUuid() }))

export function mockUuid(): () => string {
    let value = 1
    beforeEach(() => {
        value = 1
    })
    return () => `000${(value++).toString()}-000`
}
