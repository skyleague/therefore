import { renderTemplate } from '../../../common/template/template.js'
import { constants } from '../../../lib/constants.js'
import type { Node } from '../../../lib/cst/node.js'

import { mapValues, partition } from '@skyleague/axioms'

abstract class References<ReferenceType = string> {
    public references = new Map<string, Set<ReferenceType>>()
    public symbols = new Map<string, Node>()
    public key2node = new Map<string, Node>()
    public _data: Record<string, () => string> = {}
    public transformers: Record<string, ((current: string) => string)[]> = {}

    public declare ReferenceType: ReferenceType

    protected reference(node: Node, type: ReferenceType) {
        if (!this.symbols.has(node._id)) {
            this.symbols.set(node._id, node)
        }
        const nodeRefs = this.references.get(node._id) ?? new Set()
        if (!this.references.has(node._id)) {
            this.references.set(node._id, nodeRefs)
        }
        nodeRefs.add(type)

        const key = this.key(node, type)

        this.key2node.set(key, node)

        this.setDataAndTransform(node, key, type)

        return `{{${key}}}`
    }

    public resolveData(data: Record<string, string>): Record<string, string> {
        const isReference = (value: string) => value.includes('{{') && value.includes('}}')
        const [unsolved, _solved] = partition(Object.entries(data), ([, value]) => isReference(value))
        const solved = Object.fromEntries(_solved)
        let foundUnsolved: [string, string][] = unsolved

        let sweeps = 0
        const maxSweeps = 3
        while (foundUnsolved.length > 0 && sweeps < maxSweeps) {
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
            if (sweeps++ >= maxSweeps) {
                break
            }
        }
        return solved
    }

    public key(node: Node, type: ReferenceType) {
        return `${node._id}:${type}`
    }

    public data() {
        const rawData = mapValues(this._data, (s) => s())
        const transformedData: Record<string, string> = {}

        for (const [key, value] of Object.entries(rawData)) {
            let currentValue = value
            const keyTransformers = this.transformers[key] ?? []
            for (const transformer of keyTransformers) {
                currentValue = transformer(currentValue)
            }
            transformedData[key] = currentValue
        }

        return transformedData
    }

    protected abstract setDataAndTransform(node: Node, key: string, type: ReferenceType): void
}

export class TypescriptReferences extends References<
    'value:export' | 'type:export' | 'value:name' | 'type:name' | 'value:source' | 'type:source' | 'type:reference' // | 'value:reference'
> {
    public value(node: Node): string {
        return this.reference(node, 'value:name')
    }

    public type(node: Node): string {
        return this.reference(node, 'type:reference')
    }

    public valueExport(node: Node): string {
        return this.reference(node, 'value:export')
    }

    public typeExport(node: Node): string {
        return this.reference(node, 'type:export')
    }

    public typeName(node: Node): string {
        return this.reference(node, 'type:name')
    }

    public typeSource(node: Node): string {
        return this.reference(node, 'type:source')
    }
    public valueSource(node: Node): string {
        return this.reference(node, 'value:source')
    }

    protected setDataAndTransform(node: Node, key: string, type: TypescriptReferences['ReferenceType']): void {
        const effectiveFallback = this.getFallbackType(type)
        const fallbackKey = effectiveFallback !== type ? this.reference(node, effectiveFallback) : undefined
        const debugKey = (str: string) => (constants.debug ? `/**${key}??*/${str}` : str)
        this._data[key] ??= () => {
            const attributes = node._attributes.typescript
            const attrValue = attributes[type]
            const value = attrValue ?? fallbackKey
            if (value === undefined) {
                throw new Error(`Reference ${key} not found`)
            }
            const transformKey = type
            const transform = node._transform?.[transformKey]
            if (transform !== undefined) {
                return debugKey(transform(value))
            }
            return debugKey(value)
        }
        // this.transformers[key] ??= []
    }

    private getFallbackType(type: TypescriptReferences['ReferenceType']): TypescriptReferences['ReferenceType'] {
        if (type === 'type:reference') {
            return 'type:name'
        }

        if (type === 'value:name') {
            return 'value:source'
        }

        if (type === 'type:name') {
            return 'type:source'
        }

        if (type === 'value:export') {
            return 'value:source'
        }

        if (type === 'type:export') {
            return 'type:source'
        }

        return type
    }
}

export class GenericReferences extends References<'value:name'> {
    public name(node: Node): string {
        return this.reference(node, 'value:name')
    }

    protected setDataAndTransform(node: Node, key: string, type: GenericReferences['ReferenceType']): void {
        this._data[key] ??= () => {
            const attributes = node._attributes.generic
            const value = attributes[type]
            if (value === undefined) {
                throw new Error(`Reference ${key} not found`)
            }
            const transform = node._transform?.[type]
            if (transform !== undefined) {
                return transform(value)
            }
            return value
        }
        this.transformers[key] ??= []
    }
}
