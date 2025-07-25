import { beforeEach } from 'vitest'
import { GenericFileOutput } from '../../src/commands/generate/output/generic.js'
import { TypescriptFileOutput } from '../../src/commands/generate/output/typescript.js'
import { _resetId } from '../../src/lib/cst/id.js'
import { therefore } from '../../src/lib/primitives/therefore.js'

beforeEach(() => {
    _resetId()
})

therefore.generators = [GenericFileOutput, TypescriptFileOutput]
