import type { SchemaOptions } from '../base.js'
import type { ConstType } from '../const/const.js'
import { $const } from '../const/const.js'
import type { EnumOptions } from '../enum/enum.js'

/**
 * Create a new `ConstType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $null
 *
 * $null()
 * ```
 *
 * @param options - Additional options to pass to the null.
 *
 * @group Primitives
 */
export function $null(options: SchemaOptions<EnumOptions> = {}): ConstType<null> {
    return $const(null, options)
}
