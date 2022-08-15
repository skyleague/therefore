import { action } from './action'
import { command } from './command'
import { icon, uri } from './icon'

import { $string, $ref, $array, $object, $enum, $boolean, $dict, $optional, $unknown, $validator } from '../../src'

// https://json.schemastore.org/chrome-manifest

const version_string = $string({ pattern: /^(?:\d{1,5}\.){0,3}\d{1,5}$/, name: 'versionString' })

const page = $ref(uri, { name: 'page' })

const scripts = $array($ref(uri), {
    name: 'scripts',
    minItems: 1,
    uniqueItems: true,
})

const content_security_policy = $string({
    name: 'contentSecurityPolicy',
    description:
        'This introduces some fairly strict policies that will make extensions more secure by default, and provides you with the ability to create and enforce rules governing the types of content that can be loaded and executed by your extensions and applications.',
    //format: 'content-security-policy',
    default: "script-src 'self'; object-src 'self'",
})

const glob_pattern = $string({
    name: 'glob pattern',
    //format: 'glob-pattern'
})

const match_pattern = $string({
    name: 'match pattern',
    //format: 'match-pattern'
    //pattern: /^((\\*|http|https|file|ftp|chrome-extension):\\/\\/(\\*|\\*\\.[^\\/\\*]+|[^\\/\\*]+)?(\\/.*))|<all_urls>$/
})

const mime_type = $string({
    name: 'mime_type',
    //format: 'mime-type',
    pattern: /^(?:application|audio|image|message|model|multipart|text|video)\/[-+.\\w]+$/,
})

const permissions = $array(
    $string({
        //format: 'permission'
    }),
    {
        name: 'permissions',
        //   uniqueItems: true,
    }
)

export const extension = $validator(
    $object({
        title: 'JSON schema for Google Chrome extension manifest files',
        properties: {
            manifest_version: $enum([2], {
                description: 'One integer specifying the version of the manifest file format your package requires.',
            }),
            name: $string({
                description: 'The name of the extension',
                maxLength: 45,
            }),
            version: $ref({
                description: 'One to four dot-separated integers identifying the version of this extension.',
                reference: version_string,
            }),
            default_locale: $string({
                description: 'Specifies the subdirectory of _locales that contains the default strings for this extension.',
                default: 'en',
            }),
            description: $string({
                description: 'A plain text description of the extension',
                maxLength: 132,
            }),
            icons: $object({
                description:
                    'One or more icons that represent the extension, app, or theme. Recommended format: PNG; also BMP, GIF, ICO, JPEG.',
                minProperties: 1,
                properties: {
                    '16': $ref({
                        description: "Used as the favicon for an extension's pages and infobar.",
                        reference: icon,
                    }),
                    '48': $ref({
                        description: 'Used on the extension management page (chrome://extensions).',
                        reference: icon,
                    }),
                    '128': $ref({
                        description: 'Used during installation and in the Chrome Web Store.',
                        reference: icon,
                    }),
                    '256': $ref({
                        description: 'Used during installation and in the Chrome Web Store.',
                        reference: icon,
                    }),
                },
            }),
            browser_action: $ref({
                description:
                    'Use browser actions to put icons in the main Google Chrome toolbar, to the right of the address bar. In addition to its icon, a browser action can also have a tooltip, a badge, and a popup.',
                reference: action,
            }),
            page_action: $ref({
                description:
                    "Use the chrome.pageAction API to put icons inside the address bar. Page actions represent actions that can be taken on the current page, but that aren't applicable to all pages.",
                reference: action,
            }),
            background: $object({
                description:
                    'The background page is an HTML page that runs in the extension process. It exists for the lifetime of your extension, and only one instance of it at a time is active.',
                // dependencies: {
                //     page: { not: { required: ['scripts'] } },
                //     scripts: { not: { required: ['page'] } },
                // },
                properties: {
                    persistent: $boolean({
                        description: 'When false, makes the background page an event page (loaded only when needed).',
                        default: true,
                    }),
                    page: $ref({
                        description: 'Specify the HTML of the background page.',
                        default: 'background.html',
                        reference: uri,
                    }),
                    scripts: $ref({
                        description:
                            'A background page will be generated by the extension system that includes each of the files listed in the scripts property.',
                        default: ['background.js'],
                        reference: scripts,
                    }),
                },
            }),
            chrome_url_overrides: $object({
                description:
                    'Override pages are a way to substitute an HTML file from your extension for a page that Google Chrome normally provides.',
                maxProperties: 1,
                properties: {
                    bookmarks: $ref({
                        description:
                            'The page that appears when the user chooses the Bookmark Manager menu item from the Chrome menu or, on Mac, the Bookmark Manager item from the Bookmarks menu. You can also get to this page by entering the URL chrome://bookmarks.',
                        default: 'bookmarks.html',
                        reference: page,
                    }),
                    history: $ref({
                        description:
                            'The page that appears when the user chooses the History menu item from the Chrome menu or, on Mac, the Show Full History item from the History menu. You can also get to this page by entering the URL chrome://history.',
                        default: 'history.html',
                        reference: page,
                    }),
                    newtab: $ref({
                        description:
                            'The page that appears when the user creates a new tab or window. You can also get to this page by entering the URL chrome://newtab.',
                        default: 'newtab.html',
                        reference: page,
                    }),
                },
            }),
            commands: $dict($ref(command), {
                description:
                    'Use the commands API to add keyboard shortcuts that trigger actions in your extension, for example, an action to open the browser action or send a command to the extension.',
                // patternProperties: {
                //     '.*': { $ref: '#/definitions/command' },
                //     '^_execute_browser_action$': { $ref: '#/definitions/command' },
                //     '^_execute_page_action$': { $ref: '#/definitions/command' },
                // },
            }),
            content_scripts: $array(
                $object({
                    //required: ['matches'],
                    matches: $array($ref(match_pattern), {
                        description: 'Specifies which pages this content script will be injected into.',
                        minItems: 1,
                        uniqueItems: true,
                    }),
                    exclude_matches: $array($ref(match_pattern), {
                        description: 'Excludes pages that this content script would otherwise be injected into.',
                        uniqueItems: true,
                    }),
                    css: $array($ref(uri), {
                        description:
                            'The list of CSS files to be injected into matching pages. These are injected in the order they appear in this array, before any DOM is constructed or displayed for the page.',
                        uniqueItems: true,
                    }),
                    js: $ref({
                        description:
                            'The list of JavaScript files to be injected into matching pages. These are injected in the order they appear in this array.',
                        reference: scripts,
                    }),
                    run_at: $enum(['document_start', 'document_end', 'document_idle'], {
                        description: 'Controls when the files in js are injected.',
                        default: 'document_idle',
                    }),
                    all_frames: $boolean({
                        description:
                            'Controls whether the content script runs in all frames of the matching page, or only the top frame.',
                        default: false,
                    }),
                    include_globs: $array($ref(glob_pattern), {
                        description:
                            'Applied after matches to include only those URLs that also match this glob. Intended to emulate the @include Greasemonkey keyword.',
                        uniqueItems: true,
                    }),
                    exclude_globs: $array($ref(glob_pattern), {
                        description:
                            'Applied after matches to exclude URLs that match this glob. Intended to emulate the @exclude Greasemonkey keyword.',
                        uniqueItems: true,
                    }),
                    match_about_blank: $boolean({
                        description: 'Whether to insert the content script on about:blank and about:srcdoc.',
                        default: false,
                    }),
                }),
                {
                    description: 'Content scripts are JavaScript files that run in the context of web pages.',
                    minItems: 1,
                    uniqueItems: true,
                }
            ),
            content_security_policy: $ref(content_security_policy),
            devtools_page: $ref({
                description:
                    'A DevTools extension adds functionality to the Chrome DevTools. It can add new UI panels and sidebars, interact with the inspected page, get information about network requests, and more.',
                reference: page,
            }),
            externally_connectable: $object({
                description:
                    'Declares which extensions, apps, and web pages can connect to your extension via runtime.connect and runtime.sendMessage.',
                properties: {
                    ids: $array($string, {
                        description:
                            'The IDs of extensions or apps that are allowed to connect. If left empty or unspecified, no extensions or apps can connect.',
                    }),
                    matches: $array($string, {
                        description:
                            'The URL patterns for web pages that are allowed to connect. This does not affect content scripts. If left empty or unspecified, no web pages can connect.',
                    }),
                    accepts_tls_channel_id: $boolean({
                        default: false,
                        description:
                            "Indicates that the extension would like to make use of the TLS channel ID of the web page connecting to it. The web page must also opt to send the TLS channel ID to the extension via setting includeTlsChannelId to true in runtime.connect's connectInfo or runtime.sendMessage's options.",
                    }),
                },
            }),
            file_browser_handlers: $array(
                $object({
                    id: $string({
                        description: 'Used by event handling code to differentiate between multiple file handlers',
                    }),
                    default_title: $string({
                        description: 'What the button will display.',
                    }),
                    file_filters: $array($string, {
                        description: 'Filetypes to match.',
                        minItems: 1,
                    }),
                }),
                {
                    description: 'You can use this API to enable users to upload files to your website.',
                    minItems: 1,
                }
            ),
            homepage_url: $ref({
                description: 'The URL of the homepage for this extension.',
                reference: uri,
            }),
            incognito: $enum(['spanning', 'split', 'not_allowed'], {
                description: 'Specify how this extension will behave if allowed to run in incognito mode.',
                default: 'spanning',
            }),
            input_components: $array(
                $object({
                    name: $string,
                    type: $string,
                    id: $string,
                    description: $string,
                    language: $string,
                    layouts: $array($string),
                }),
                {
                    description:
                        'Allows your extension to handle keystrokes, set the composition, and manage the candidate window.',
                }
            ),
            key: $string({
                description:
                    'This value can be used to control the unique ID of an extension, app, or theme when it is loaded during development.',
            }),
            minimum_chrome_version: $ref({
                description: 'The version of Chrome that your extension, app, or theme requires, if any.',
                reference: version_string,
            }),
            nacl_modules: $array(
                $object({
                    path: $ref({
                        description: 'The location of a Native Client manifest (a .nmf file) within the extension directory.',
                        reference: uri,
                    }),
                    mime_type: $ref({
                        description: 'The MIME type for which the Native Client module will be registered as content handler.',
                        reference: mime_type,
                    }),
                }),
                {
                    description: 'One or more mappings from MIME types to the Native Client module that handles each type.',
                    minItems: 1,
                    uniqueItems: true,
                }
            ),
            oauth2: $object({
                description:
                    'Use the Chrome Identity API to authenticate users: the getAuthToken for users logged into their Google Account and the launchWebAuthFlow for users logged into a non-Google account.',
                properties: {
                    client_id: $string({
                        description: 'You need to register your app in the Google APIs Console to get the client ID.',
                    }),
                    scopes: $array($string, {
                        minItems: 1,
                    }),
                },
            }),
            offline_enabled: $boolean({
                description:
                    'Whether the app or extension is expected to work offline. When Chrome detects that it is offline, apps with this field set to true will be highlighted on the New Tab page.',
            }),
            omnibox: $object({
                description:
                    "The omnibox API allows you to register a keyword with Google Chrome's address bar, which is also known as the omnibox.",
                properties: {
                    keyword: $string({
                        description: 'The keyward that will trigger your extension.',
                    }),
                },
            }),
            optional_permissions: $ref({
                description:
                    'Use the chrome.permissions API to request declared optional permissions at run time rather than install time, so users understand why the permissions are needed and grant only those that are necessary.',
                reference: permissions,
            }),
            options_page: $ref({
                description:
                    'To allow users to customize the behavior of your extension, you may wish to provide an options page. If you do, a link to it will be provided from the extensions management page at chrome://extensions. Clicking the Options link opens a new tab pointing at your options page.',
                default: 'options.html',
                reference: page,
            }),
            options_ui: $object({
                description:
                    'To allow users to customize the behavior of your extension, you may wish to provide an options page. If you do, an Options link will be shown on the extensions management page at chrome://extensions which opens a dialogue containing your options page.',
                properties: {
                    page: $string({
                        description: "The path to your options page, relative to your extension's root.",
                    }),
                    chrome_style: $optional(
                        $boolean({
                            default: true,
                            description:
                                'If true, a Chrome user agent stylesheet will be applied to your options page. The default value is false, but we recommend you enable it for a consistent UI with Chrome.',
                        })
                    ),
                    open_in_tab: $optional(
                        $boolean({
                            default: false,
                            description:
                                "If true, your extension's options page will be opened in a new tab rather than embedded in chrome://extensions. The default is false, and we recommend that you don't change it. This is only useful to delay the inevitable deprecation of the old options UI! It will be removed soon, so try not to use it. It will break.",
                        })
                    ),
                },
            }),
            permissions: $ref({
                description:
                    'Permissions help to limit damage if your extension or app is compromised by malware. Some permissions are also displayed to users before installation, as detailed in Permission Warnings.',
                reference: permissions,
            }),
            requirements: $object({
                description:
                    'Technologies required by the app or extension. Hosting sites such as the Chrome Web Store may use this list to dissuade users from installing apps or extensions that will not work on their computer.',
                properties: {
                    '3D': $object({
                        description: "The '3D' requirement denotes GPU hardware acceleration.",
                        properties: {
                            features: $array($enum(['webgl']), {
                                description: 'List of the 3D-related features your app requires.',
                                minItems: 1,
                                uniqueItems: true,
                            }),
                        },
                    }),
                    plugins: $object({
                        description:
                            "Indicates if an app or extension requires NPAPI to run. This requirement is enabled by default when the manifest includes the 'plugins' field.",
                        properties: {
                            npapi: $boolean({
                                default: true,
                            }),
                        },
                    }),
                },
            }),
            sandbox: $object({
                description:
                    'Defines an collection of app or extension pages that are to be served in a sandboxed unique origin, and optionally a Content Security Policy to use with them.',
                //required: ['pages'],
                properties: {
                    pages: $array($ref(page), {
                        minItems: 1,
                        uniqueItems: true,
                    }),
                    content_security_policy: $ref({
                        default: 'sandbox allow-scripts allow-forms',
                        reference: content_security_policy,
                    }),
                },
            }),
            short_name: $string({
                description: 'The short name is typically used where there is insufficient space to display the full name.',
                maxLength: 12,
            }),
            update_url: $ref({
                description:
                    'If you publish using the Chrome Developer Dashboard, ignore this field. If you host your own extension or app: URL to an update manifest XML file.',
                reference: uri,
            }),
            tts_engine: $object({
                description: 'Register itself as a speech engine.',
                properties: {
                    voices: $array(
                        $object({
                            voice_name: $string({
                                description: 'Identifies the name of the voice and the engine used.',
                            }),
                            lang: $string({
                                description:
                                    'Almost always, a voice can synthesize speech in just a single language. When an engine supports more than one language, it can easily register a separate voice for each language.',
                            }),
                            gender: $string({
                                description:
                                    'If your voice corresponds to a male or female voice, you can use this parameter to help clients choose the most appropriate voice for their application.',
                            }),
                            event_types: $array($enum(['start', 'word', 'sentence', 'marker', 'end', 'error']), {
                                description: 'Events sent to update the client on the progress of speech synthesis.',
                                minItems: 1,
                                uniqueItems: true,
                                optional: true,
                            }),
                        }),
                        {
                            description: 'Voices the extension can synthesize.',
                            minItems: 1,
                            uniqueItems: true,
                        }
                    ),
                    version_name: $string({
                        description:
                            'In addition to the version field, which is used for update purposes, version_name can be set to a descriptive version string and will be used for display purposes if present.',
                    }),
                    web_accessible_resources: $array($ref(uri), {
                        description:
                            'An array of strings specifying the paths (relative to the package root) of packaged resources that are expected to be usable in the context of a web page.',
                        minItems: 1,
                        uniqueItems: true,
                    }),
                    chrome_settings_overrides: $unknown,
                    content_pack: $unknown,
                    current_locale: $unknown,
                    import: $unknown,
                    platforms: $unknown,
                    signature: $unknown,
                    spellcheck: $unknown,
                    storage: $unknown,
                    system_indicator: $unknown,
                },
            }),
        },
    })
)
