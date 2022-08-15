declare module 'swagger2openapi' {
    function convertObj<T extends any[], R>(...args: T): Promise<R>
    export default { convertObj }
}
