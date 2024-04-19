import { toLiteral } from './literal.js'

import type { Node } from '../../cst/node.js'

function escapeComment(x: string) {
    return x.replaceAll(/\*\//g, '* /')
}

// biome-ignore lint/complexity/noStaticOnlyClass: this is a utility class
export class JSDoc {
    public static fromNode(node: Node) {
        return JSDoc.from({
            key: node.attributes.typescript.symbolName ?? node.name,
            definition: {
                title: node.definition.jsonschema?.title,
                examples: node.definition.jsonschema?.examples,
                description: node.definition.description,
                default: node.definition.default,
                readonly: node.definition.readonly,
                deprecated: node.definition.deprecated,
            },
        })
    }

    public static from({
        key,
        definition,
    }: {
        key?: string
        definition: {
            title?: string | undefined
            summary?: string | undefined
            description?: string | undefined
            default?: unknown | undefined
            examples?: unknown[] | undefined
            readonly?: boolean | undefined
            deprecated?: boolean | undefined
        }
    }) {
        const docs: string[] = []
        const pad = () => (docs.length > 0 ? docs.push('') : undefined)

        const summary = definition.summary ?? definition.title
        const hasSummary = summary !== undefined && summary.length > 1
        if (hasSummary) {
            docs.push(...escapeComment(summary.trim()).split('\n'))
        }

        const description = definition.description
        if (description !== undefined && description.length > 1 && description !== summary) {
            if (hasSummary) {
                docs.push('')
            }
            docs.push(...escapeComment(description.trim()).split('\n'))
        }
        const properties: string[] = []

        const def = definition.default
        if (def !== undefined) {
            properties.push(`@default ${escapeComment(toLiteral(def))}`)
        }
        if (definition.readonly) {
            properties.push('@readonly')
        }
        if (definition.deprecated) {
            properties.push('@deprecated')
        }

        if (properties.length > 0) {
            pad()

            docs.push(...properties)
        }

        const examples = definition.examples
        if (examples && key !== undefined) {
            pad()
            for (const example of examples) {
                docs.push(`@example ${escapeComment(key)} = ${escapeComment(toLiteral(example))}`)
            }
        }

        return docs.length > 0 ? `/**\n * ${docs.join('\n * ')}\n */\n` : undefined
    }
}
