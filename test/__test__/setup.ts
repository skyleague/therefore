import { _resetId } from '../../src/lib/cst/id.js'
import { GenericFileOutput } from '../../src/lib/output/generic.js'
import { TypescriptFileOutput } from '../../src/lib/output/typescript.js'
import { therefore } from '../../src/lib/primitives/therefore.js'

import { beforeEach } from 'vitest'

beforeEach(() => {
    _resetId()
})

therefore.generators = [GenericFileOutput, TypescriptFileOutput]
