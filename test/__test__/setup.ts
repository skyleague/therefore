import { beforeEach, vi } from 'vitest'

vi.mock('uuid', () => ({ v4: mockUuid() }))

export function mockUuid(): () => string {
    let value = 1
    beforeEach(() => {
        value = 1
    })
    return () => `000${(value++).toString()}-000`
}
