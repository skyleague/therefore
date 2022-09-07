import type { CstNode } from '../../cst/cst'
import { isCstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'
import type { LazyObjectOptions, ObjectPropertiesArg } from '../object/object'
import { $object } from '../object/object'
import { $validator } from '../validator/validator'

export function $headers(properties: CstNode | ObjectPropertiesArg, options?: SchemaOptions<LazyObjectOptions>) {
    const validator = $validator(
        isCstNode(properties) ? properties : $object(properties, { additionalProperties: true, ...options })
    )
    validator.description.ajvOptions = { ...validator.description.ajvOptions, coerceTypes: true }
    return validator
}
