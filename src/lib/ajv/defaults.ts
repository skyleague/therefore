import type { Options } from 'ajv'

export const defaultAjvConfig: Options = {
    strict: true,
    strictSchema: false,
    strictTypes: true,
    strictTuples: false,
    useDefaults: true,
    logger: false,
    loopRequired: 5,
    loopEnum: 5,
    multipleOfPrecision: 4,
    code: {
        esm: true,
    },
    // AJV defaults
    // removeAdditional: false,
    // code: {
    //     optimize: true,
    // },
}
