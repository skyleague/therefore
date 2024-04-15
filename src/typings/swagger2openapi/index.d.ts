declare module 'swagger2openapi' {
    // biome-ignore lint/suspicious/noExplicitAny: it's a third-party library
    function convertObj<T extends any[], R>(...args: T): Promise<R>
    export default { convertObj }
}
