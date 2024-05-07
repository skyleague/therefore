import { NodeTrait } from '../../cst/mixin.js'
import type { SchemaOptions } from '../base.js'

import type { StringConstraints } from '@skyleague/axioms'

export const supportedFormats = [
    'date-time',
    'date',
    'time',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'uri',
    'ulid',
    'uuid',
    'base64',
    'duration',
] as const

export type StringFormat = (typeof supportedFormats)[number]
export interface StringOptions {
    /**
     * The minimum the length the string is allowed to have.
     */
    minLength?: number | undefined
    /**
     * The maximum the length the string is allowed to have.
     */
    maxLength?: number | undefined
    /**
     * The pattern the string has.
     */
    regex?: RegExp | string | undefined
    /**
     * The format the string should follow (is not used for validation).
     */
    format?: StringFormat | undefined

    arbitrary?: Partial<StringConstraints> | undefined
}

export class StringType extends NodeTrait {
    public override _type = 'string' as const

    public _options: StringOptions = {}

    public declare infer: string

    public constructor(options: SchemaOptions<StringOptions, string>) {
        super(options)
        this._options = options
    }

    public arbitrary(options: Partial<StringConstraints>) {
        this._options.arbitrary ??= {}
        this._options.arbitrary = { ...this._options.arbitrary, ...options }
        return this
    }

    public minLength(minLength: number) {
        this._options.minLength = minLength
        return this
    }

    public maxLength(maxLength: number) {
        this._options.maxLength = maxLength
        return this
    }

    public datetime() {
        this._options.format = 'date-time'
        return this
    }

    public date() {
        this._options.format = 'date'
        return this
    }

    public time() {
        this._options.format = 'time'
        return this
    }

    public email() {
        this._options.format = 'email'
        return this
    }

    public hostname() {
        this._options.format = 'hostname'
        return this
    }

    public ipv4() {
        this._options.format = 'ipv4'
        return this
    }

    public ipv6() {
        this._options.format = 'ipv6'
        return this
    }

    public uri() {
        this._options.format = 'uri'
        return this
    }

    public uuid() {
        this._options.format = 'uuid'
        return this
    }

    public base64() {
        this._options.format = 'base64'
        return this
    }

    public duration() {
        this._options.format = 'duration'
        return this
    }

    public ulid() {
        this._options.format = 'ulid'
        this._options.regex = /^[0-9A-HJKMNP-TV-Z]{26}$/
        return this
    }

    public regex(pattern: RegExp | string) {
        this._options.regex = pattern
        return this
    }
}

/**
 * Create a new `StringType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $string
 *
 * $string()
 *
 * $string({maxLength: 3})
 * ```
 *
 * @param options - Additional options to pass to the string.
 * @returns A StringType.
 *
 * @group Primitives
 */
export function $string(options: SchemaOptions<StringOptions, string> = {}): StringType {
    return new StringType(options)
}
