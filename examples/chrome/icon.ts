import { $ref, $string } from '../../src/index.js'

export const uri = $string({ name: 'uri' })
export const icon = $ref(uri, { name: 'icon' })
