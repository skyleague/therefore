import { plugin } from './internal.js'

import { $array, $boolean, $enum, $object, $string, $union, $validator } from '../../src/index.js'

const readme = $union([$enum(['none']), $string], {
    name: 'readme',
}).describe(
    'Path to the readme file that should be displayed on the index page. Pass none to disable the index page and start the documentation on the globals page.',
)

const src = $union([$string, $string().array()], {
    name: 'src',
}).describe('The sources files from which to build documentation.\nDEPRECATED: Use inputFiles instead.')

export const theme = $union([$enum(['default', 'minimal']), $string], {
    name: 'theme',
})
    .describe('Specify the path to the theme that should be used.')
    .validator()

export const typedoc = $validator(
    $object({
        disableOutputCheck: $boolean({
            default: false,
        }).describe('Should TypeDoc disable the testing and cleaning of the output directory?'),
        entryPoint: $string().default('./').describe('Specifies the fully qualified name of the root symbol.'),
        exclude: $array($string).describe(
            'Exclude files by the given pattern when a path is provided as source. Supports minimatch patterns.',
        ),
        excludeExternals: $boolean()
            .default(false)
            .describe('Prevent externally resolved TypeScript files from being documented.'),
        excludeNotExported: $boolean().default(false).describe('Prevent symbols that are not exported from being documented.'),
        excludePrivate: $boolean().default(false).describe('Ignores private variables and methods'),
        excludeProtected: $boolean().default(false).describe('Ignores protected variables and methods'),
        externalPattern: $string().array().describe('Define a pattern for files that should be considered being external.'),
        gaID: $string().describe('Set the Google Analytics tracking ID and activate tracking code.'),
        gaSite: $string().default('auto').describe('Set the site name for Google Analytics.'),
        gitRevision: $string().describe(
            'Use specified revision or branch instead of the last revision for linking to GitHub source files.',
        ),
        hideGenerator: $boolean().default(false).describe('Do not print the TypeDoc link at the end of the page.'),
        ignoreCompilerErrors: $boolean()
            .default(false)
            .describe('Generates documentation, even if the project does not TypeScript compile.'),
        includeDeclarations: $boolean().default(false).describe('Turn on parsing of .d.ts declaration files.'),
        includes: $string().describe(
            'Specifies the location to look for included documents (use [[include:FILENAME]] in comments).',
        ),
        inputFiles: $string().array().describe('The sources files from which to build documentation.'),
        json: $string().describe('Specifies the location to output a JSON file containing all of the reflection data.'),
        listInvalidSymbolLinks: $boolean()
            .default(false)
            .describe('Emits a list of broken symbol [[navigation]] links after documentation generation'),
        logger: $enum(['console', 'none']).default('console').describe('Specify the logger that should be used.'),
        media: $string().describe('Specifies the location with media files that should be copied to the output directory.'),
        mode: $enum(['file', 'modules'])
            .default('modules')
            .describe('Specifies the output mode the project is used to be compiled with.'),
        name: $string().describe('Set the name of the project that will be used in the header of the template.'),
        out: $string().describe('Specifies the location the documentation should be written to.'),
        plugin: plugin.reference(),
        includeVersion: $boolean()
            .default(false)
            .describe('Add the package version according to package.json to the projects name.'),
        excludeTags: $string()
            .array()
            .default([])
            .describe('Specify tags that should be removed from doc comments when parsing.'),
        readme: readme.reference(),
        src: src.reference(),
        stripInternal: $boolean().default(false).describe('Remove reflections annotated with @internal'),
        theme: theme.reference(),
        toc: $string().array().describe('Specifies the top level table of contents.'),
        tsconfig: $string({})
            .default('./tsconfig.json')
            .describe(
                "Specify a typescript config file that should be loaded. If not specified TypeDoc will look for 'tsconfig.json' in the current directory.",
            ),
    }).jsonschema({ title: 'JSON Schema for typedoc.json' }),
)
