import type { SchemaOptions } from '../base'
import type { EnumOptions, EnumType } from '../enum'
import { $enum } from '../enum'

import type { Json } from '@skyleague/axioms'

export function $const<T extends Json>(value: T, options: SchemaOptions<EnumOptions> = {}): EnumType {
    return $enum<T>([value], options)
}
