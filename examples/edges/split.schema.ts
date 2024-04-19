import { $enum } from '../../src/lib/primitives/enum/enum.js'
import { $object } from '../../src/lib/primitives/object/object.js'
import { $string } from '../../src/lib/primitives/string/string.js'

export const eventTypes = $enum(['start', 'word', 'sentence', 'marker', 'end', 'error']).array().nonempty().set().optional()

export const matchPattern = $string({
    name: 'match pattern',
}).regex(/^((\\*|http|https|file|ftp|chrome-extension):\/\/(\*|\*\.[^\/\*]+|[^\/\*]+)?(\/.*))|<all_urls>$/)

export const contentScripts = $object({
    matches: matchPattern
        .reference()
        .array()
        .minItems(1)
        .set()
        .describe('Specifies which pages this content script will be injected into.'),
})
