import { NodeTrait } from '../../cst/mixin.js'
import type { SchemaOptions } from '../base.js'

import type { StringConstraints } from '@skyleague/axioms'

export const supportedFormats = ['date-time', 'date', 'time', 'email', 'hostname', 'ipv4', 'ipv6', 'uri', 'ulid', 'uuid'] as const

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
    public override type = 'string' as const

    public options: StringOptions = {}

    public declare infer: string

    public constructor(options: SchemaOptions<StringOptions, string>) {
        super(options)
        this.options = options
    }

    public arbitrary(options: Partial<StringConstraints>) {
        this.options.arbitrary ??= {}
        this.options.arbitrary = { ...this.options.arbitrary, ...options }
        return this
    }

    public minLength(minLength: number) {
        this.options.minLength = minLength
        return this
    }

    public maxLength(maxLength: number) {
        this.options.maxLength = maxLength
        return this
    }

    public datetime() {
        this.options.format = 'date-time'
        return this
    }

    public date() {
        this.options.format = 'date'
        return this
    }

    public time() {
        this.options.format = 'time'
        return this
    }

    public email() {
        this.options.format = 'email'
        return this
    }

    public hostname() {
        this.options.format = 'hostname'
        return this
    }

    public ipv4() {
        this.options.format = 'ipv4'
        return this
    }

    public ipv6() {
        this.options.format = 'ipv6'
        return this
    }

    public uri() {
        this.options.format = 'uri'
        return this
    }

    public uuid() {
        this.options.format = 'uuid'
        return this
    }

    public ulid() {
        this.options.format = 'ulid'
        this.options.regex = /^[0-9A-HJKMNP-TV-Z]{26}$/
        return this
    }

    public regex(pattern: RegExp | string) {
        this.options.regex = pattern
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
