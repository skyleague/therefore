import type { Options } from 'ajv'

export const defaultAjvConfig: Options = {
    strict: true,
    strictTypes: true,
    useDefaults: true,
    strictSchema: false,
    logger: false,
    loopRequired: 5,
    loopEnum: 5,
    // AJV defaults
    // removeAdditional: false,
    // code: {
    //     optimize: true,
    // },
}
