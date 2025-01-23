import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { $restclient } from '../../src/lib/primitives/restclient/restclient.js'

const apiSpec = parse(readFileSync(new URL('./todo-api.yaml', import.meta.url), 'utf8'))

export const todoClient = $restclient(apiSpec, {
    validator: 'zod',
    client: 'ky',
})
