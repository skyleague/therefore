import { renderTemplate } from '../../common/template/template.js'
import type { Node } from '../cst/node.js'

import { mapValues, partition, range, sha256 } from '@skyleague/axioms'

export const referenceTypes = ['symbolName', 'referenceName', 'aliasName'] as const
export type ReferenceType = (typeof referenceTypes)[number]

export class References<Type extends 'typescript' | 'generic'> {
    public references = new Map<string, Set<string>>()
    public symbols = new Map<string, Node>()
    public key2node = new Map<string, Node>()
    // late binding
    public _data: Record<string, () => string> = {}
    public transform: Record<string, (transformer: (current: string) => string) => void> = {}
    public type: Type
    public hardlinks: Record<string, string> = {}
    public fallbackStrategy: (node: Node, type: ReferenceType) => ReferenceType

    public constructor(
        type: Type,
        { fallbackStrategy }: { fallbackStrategy?: (node: Node, type: ReferenceType) => ReferenceType } = {},
    ) {
        this.type = type
        this.fallbackStrategy = fallbackStrategy ?? (() => 'symbolName')
    }

    public from<T extends 'typescript' | 'generic'>(references: References<T>): void {
        for (const symbol of references.symbols.values()) {
            for (const ref of references.references.get(symbol.id) ?? []) {
                if (referenceTypes.includes(ref as ReferenceType)) {
                    this.reference(symbol, ref as ReferenceType)
                }
            }
        }
    }

    public render(content: string): string {
        let rendered = content
        for (const [key, value] of Object.entries(this.hardlinks)) {
            rendered = rendered.replaceAll(key, value)
        }
        return rendered
    }

    public hardlink(node: Node, type: ReferenceType, { tag }: { tag?: string } = {}): string {
        const key = `SYMB_${node.attributes[this.type][type]}_${sha256(node.id).slice(6)}_${type.toUpperCase()}_${tag}`
        this.hardlinks[key] = this.reference(node, type)
        return key
    }

    public reference(node: Node, type: ReferenceType, { tag, fallback }: { tag?: string; fallback?: ReferenceType } = {}) {
        fallback ??= type === 'referenceName' ? 'aliasName' : 'symbolName'

        if (!this.symbols.has(node.id)) {
            this.symbols.set(node.id, node)
        }
        if (!this.references.has(node.id)) {
            this.references.set(node.id, new Set())
        }
        // biome-ignore lint/style/noNonNullAssertion: the value was just set above
        const reference = this.references.get(node.id)!
        reference.add(type)
        if (tag !== undefined) {
            reference.add(tag)
        }

        const key = this.key(node, type)

        const fallbackKey = fallback !== type ? this.reference(node, fallback) : undefined

        this.key2node.set(key, node)
        this._data[key] ??= () => {
            const value = node.attributes[this.type][type] ?? fallbackKey
            if (value === undefined) {
                throw new Error(`Reference ${key} not found`)
            }
            const transform = node.transform?.[type]
            if (transform !== undefined) {
                return transform(value)
            }
            return value
        }
        this.transform[key] ??= (transformer) => {
            const name = node.attributes[this.type][type]
            if (name === undefined) {
                throw new Error(`Reference ${key} not found`)
            }
            node.attributes[this.type][type] = transformer(name)
        }

        return `{{${key}}}`
    }

    public resolveData(data: Record<string, string>): Record<string, string> {
        const isReference = (value: string) => value.includes('{{') && value.includes('}}')
        const [unsolved, _solved] = partition(Object.entries(data), ([, value]) => isReference(value))
        const solved = Object.fromEntries(_solved)
        let foundUnsolved: [string, string][] = unsolved
        for (const _ of range(unsolved.length)) {
            const newUnsolved: [string, string][] = []
            for (const [key, value] of foundUnsolved) {
                const newValue = renderTemplate(value, solved)
                if (isReference(newValue)) {
                    newUnsolved.push([key, newValue])
                } else {
                    solved[key] = newValue
                }
            }
            foundUnsolved = newUnsolved
        }
        return solved
    }

    public key(node: Node, type: ReferenceType) {
        return `${node.id}:${type}`
    }

    public data() {
        return mapValues(this._data, (s) => s())
    }
}
