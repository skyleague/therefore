import type { Options } from 'ajv'

export const defaultAjvConfig: Options = {
    strict: true,
    strictTypes: true,
    useDefaults: true,
    removeAdditional: false,
    strictSchema: false,
    loopRequired: 5,
    loopEnum: 5,
    code: {
        optimize: true,
    },
}
