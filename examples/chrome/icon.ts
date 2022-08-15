import { $ref, $string } from '../../src'

export const uri = $string({ name: 'uri' })
export const icon = $ref(uri, { name: 'icon' })
