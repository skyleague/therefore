import { v4 as uuid } from 'uuid'
jest.mock('uuid')

export function mockUuid(): () => string {
    let value = 1
    return () => `000${(value++).toString()}-000`
}

beforeEach(() => (uuid as jest.Mock).mockImplementation(mockUuid()))
