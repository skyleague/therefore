/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import type { ValidateFunction } from 'ajv'

export type GetEmployeesResponse = string

export const GetEmployeesResponse = {
    validate: require('./schemas/get-employees-response.schema.js') as ValidateFunction<GetEmployeesResponse>,
    get schema() {
        return GetEmployeesResponse.validate.schema
    },
    is: (o: unknown): o is GetEmployeesResponse => GetEmployeesResponse.validate(o) === true,
} as const
