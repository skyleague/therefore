import { toLiteral } from './literal'

import type { MetaDescription } from '../../primitives/base'

function escapeComment(x: string) {
    return x.replaceAll(/\*\//g, '* /')
}

export function toJSDoc({ key, meta }: { key?: string; meta: MetaDescription }): string | undefined {
    const docs: string[] = []
    const pad = () => (docs.length > 0 ? docs.push('') : undefined)

    const summary = meta.summary ?? meta.title
    const hasSummary = summary !== undefined && summary.length > 1
    if (hasSummary) {
        docs.push(...escapeComment(summary).split('\n'))
    }

    const description = meta.description
    if (description !== undefined && description.length > 1 && description !== summary) {
        if (hasSummary) {
            docs.push('')
        }
        docs.push(...escapeComment(description).split('\n'))
    }
    const properties: string[] = []

    const def = meta.default
    if (def !== undefined) {
        properties.push(`@default ${escapeComment(toLiteral(def))}`)
    }
    if (meta.readonly === true) {
        properties.push(`@readonly`)
    }
    if (meta.deprecated === true) {
        properties.push(`@deprecated`)
    }

    if (properties.length > 0) {
        pad()

        docs.push(...properties)
    }

    const examples = meta.examples
    if (examples && key !== undefined) {
        pad()
        for (const example of examples) {
            docs.push(`@example ${escapeComment(key)} = ${escapeComment(toLiteral(example))}`)
        }
    }

    return docs.length > 0 ? `/**\n * ${docs.join('\n * ')}\n */\n` : undefined
}
