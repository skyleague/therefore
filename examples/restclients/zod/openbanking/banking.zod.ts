/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import { z } from 'zod'

export const OBError1 = z.object({
    ErrorCode: z.string().describe('Low level textual error code, e.g., UK.OBIE.Field.Missing'),
    Message: z
        .string()
        .min(1)
        .max(500)
        .describe(
            `A description of the error that occurred. e.g., 'A mandatory field isn't supplied' or 'RequestedExecutionDateTime must be in future'\\nOBIE doesn't standardise this field`,
        ),
    Path: z
        .string()
        .min(1)
        .max(500)
        .describe(
            'Recommended but optional reference to the JSON Path of the field with error, e.g., Data.Initiation.InstructedAmount.Currency',
        )
        .optional(),
    Url: z
        .string()
        .describe('URL to help remediate the problem, or provide more information, or to API Reference, or help etc')
        .optional(),
})

export const File = z.object({})

export const OBErrorResponse1 = z
    .object({
        Code: z.string().min(1).max(40).describe('High level textual error code, to help categorize the errors.'),
        Errors: z.array(OBError1).nonempty(),
        Id: z
            .string()
            .min(1)
            .max(40)
            .describe('A unique reference for the error instance, for audit purposes, in case of unknown/unclassified errors.')
            .optional(),
        Message: z
            .string()
            .min(1)
            .max(500)
            .describe(`Brief Error message, e.g., 'There is something wrong with the request parameters provided'`),
    })
    .describe('An array of detail error codes, and messages, and URLs to documentation to help remediation.')

export type File = z.infer<typeof File>

export type OBErrorResponse1 = z.infer<typeof OBErrorResponse1>
