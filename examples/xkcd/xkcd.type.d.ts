import type { ValidateFunction } from 'ajv';
export interface Comic {
    alt?: string;
    day?: string;
    img?: string;
    link?: string;
    month?: string;
    news?: string;
    num?: number;
    safe_title?: string;
    title?: string;
    transcript?: string;
    year?: string;
}
export declare const Comic: {
    readonly validate: ValidateFunction<Comic>;
    readonly schema: import("ajv").AnySchema;
    readonly is: (o: unknown) => o is Comic;
    readonly assert: (o: unknown) => void;
};
