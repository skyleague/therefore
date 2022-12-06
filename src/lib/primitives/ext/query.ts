import type { ThereforeNode } from '../../cst/cst'
import { isThereforeNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'
import type { LazyObjectOptions, ObjectPropertiesArg } from '../object/object'
import { $object } from '../object/object'
import { $validator } from '../validator/validator'

export function $query(properties: ObjectPropertiesArg | ThereforeNode, options?: SchemaOptions<LazyObjectOptions>) {
    const validator = $validator(
        isThereforeNode(properties) ? properties : $object(properties, { additionalProperties: true, ...options })
    )
    validator.description.ajvOptions = { ...validator.description.ajvOptions, coerceTypes: true }
    return validator
}
