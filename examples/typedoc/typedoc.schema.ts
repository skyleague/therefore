import { plugin } from './internal'

import { $array, $boolean, $enum, $object, $ref, $string, $union, $validator } from '../../src'

const readme = $union([$enum(['none']), $string], {
    name: 'readme',
    description:
        'Path to the readme file that should be displayed on the index page. Pass none to disable the index page and start the documentation on the globals page.',
})

const src = $union([$string, $array($string)], {
    name: 'src',
    description: 'The sources files from which to build documentation.\nDEPRECATED: Use inputFiles instead.',
})

const theme = $union([$enum(['default', 'minimal']), $string], {
    name: 'theme',
    description: 'Specify the path to the theme that should be used.',
})

export const typedoc = $validator(
    $object({
        title: 'JSON Schema for typedoc.json',
        properties: {
            disableOutputCheck: $boolean({
                default: false,
                description: 'Should TypeDoc disable the testing and cleaning of the output directory?',
            }),
            entryPoint: $string({
                default: './',
                description: 'Specifies the fully qualified name of the root symbol.',
            }),
            exclude: $array($string, {
                description: 'Exclude files by the given pattern when a path is provided as source. Supports minimatch patterns.',
            }),
            excludeExternals: $boolean({
                default: false,
                description: 'Prevent externally resolved TypeScript files from being documented.',
            }),
            excludeNotExported: $boolean({
                default: false,
                description: 'Prevent symbols that are not exported from being documented.',
            }),
            excludePrivate: $boolean({
                default: false,
                description: 'Ignores private variables and methods',
            }),
            excludeProtected: $boolean({
                default: false,
                description: 'Ignores protected variables and methods',
            }),
            externalPattern: $array($string, {
                description: 'Define a pattern for files that should be considered being external.',
            }),
            gaID: $string({
                description: 'Set the Google Analytics tracking ID and activate tracking code.',
            }),
            gaSite: $string({
                default: 'auto',
                description: 'Set the site name for Google Analytics.',
            }),
            gitRevision: $string({
                description: 'Use specified revision or branch instead of the last revision for linking to GitHub source files.',
            }),
            hideGenerator: $boolean({
                default: false,
                description: 'Do not print the TypeDoc link at the end of the page.',
            }),
            ignoreCompilerErrors: $boolean({
                default: false,
                description: 'Generates documentation, even if the project does not TypeScript compile.',
            }),
            includeDeclarations: $boolean({
                default: false,
                description: 'Turn on parsing of .d.ts declaration files.',
            }),
            includes: $string({
                description: 'Specifies the location to look for included documents (use [[include:FILENAME]] in comments).',
            }),
            inputFiles: $array($string, {
                description: 'The sources files from which to build documentation.',
            }),
            json: $string({
                description: 'Specifies the location to output a JSON file containing all of the reflection data.',
            }),
            listInvalidSymbolLinks: $boolean({
                default: false,
                description: 'Emits a list of broken symbol [[navigation]] links after documentation generation',
            }),
            logger: $enum(['console', 'none'], {
                default: 'console',
                description: 'Specify the logger that should be used.',
            }),
            media: $string({
                description: 'Specifies the location with media files that should be copied to the output directory.',
            }),
            mode: $enum(['file', 'modules'], {
                default: 'modules',
                description: 'Specifies the output mode the project is used to be compiled with.',
            }),
            name: $string({
                description: 'Set the name of the project that will be used in the header of the template.',
            }),
            out: $string({
                description: 'Specifies the location the documentation should be written to.',
            }),
            plugin: $ref(plugin),
            includeVersion: $boolean({
                default: false,
                description: 'Add the package version according to package.json to the projects name.',
            }),
            excludeTags: $array($string, {
                default: [],
                description: 'Specify tags that should be removed from doc comments when parsing.',
            }),
            readme: $ref(readme),
            src: $ref(src),
            stripInternal: $boolean({
                default: false,
                description: 'Remove reflections annotated with @internal',
            }),
            theme: $ref(theme),
            toc: $array($string, {
                description: 'Specifies the top level table of contents.',
            }),
            tsconfig: $string({
                default: './tsconfig.json',
                description:
                    "Specify a typescript config file that should be loaded. If not specified TypeDoc will look for 'tsconfig.json' in the current directory.",
            }),
        },
    })
)
