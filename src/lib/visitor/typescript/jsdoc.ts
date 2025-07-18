import { omitUndefined } from '@skyleague/axioms'
import type { Node } from '../../cst/node.js'
import { NullableType } from '../../primitives/nullable/nullable.js'
import { OptionalType } from '../../primitives/optional/optional.js'
import { toLiteral } from './literal.js'

function escapeComment(x: string) {
    return x.replaceAll(/\*\//g, '* /')
}

// biome-ignore lint/complexity/noStaticOnlyClass: this is a utility class
export class JSDoc {
    public static fromNode(node: Node) {
        const toDefinition = (value: Node) => ({
            key: value._attributes.typescript.symbolName ?? value._name,
            _definition: omitUndefined({
                title: value._definition.jsonschema?.title,
                examples: value._definition.jsonschema?.examples,
                description: value._definition.description,
                default: value._definition.default,
                readonly: value._definition.readonly,
                deprecated: value._definition.deprecated,
            }),
        })
        const definition = toDefinition(node)
        let field = node
        while (field instanceof OptionalType || field instanceof NullableType) {
            field = field.unwrap()
            const fieldDefinition = toDefinition(field)
            definition.key ??= fieldDefinition.key
            definition._definition = { ...fieldDefinition._definition, ...definition._definition }
        }
        return JSDoc.from(definition)
    }

    public static from({
        key,
        _definition: definition,
        prepend,
        append,
    }: {
        key?: string
        prepend?: string
        append?: string
        _definition: {
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

        if (prepend !== undefined) {
            docs.push(...escapeComment(prepend.trim()).split('\n'))
        }

        const summary = definition.summary ?? definition.title
        const hasSummary = summary !== undefined && summary.length > 1
        if (hasSummary) {
            if (docs.length > 0) {
                docs.push('')
            }
            docs.push(...escapeComment(summary.trim()).split('\n'))
        }

        const description = definition.description
        if (description !== undefined && description.length > 1 && description !== summary) {
            if (docs.length > 0) {
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

        if (append !== undefined) {
            if (docs.length > 0) {
                docs.push('')
            }
            docs.push(...escapeComment(append.trim()).split('\n'))
        }

        return docs.length > 0 ? `/**\n * ${docs.join('\n * ')}\n */\n` : undefined
    }
}
