import type { Node } from './node.js'

export type Intrinsic<Element extends Node> = Element extends { intrinsic: unknown } ? Element['intrinsic'] : Element
export type InferWith<Element extends Node, Value> = Omit<Element, 'infer'> & {
    infer: (Element extends { infer: unknown } ? Element['infer'] : Element) | Value
}

export type AsOptional<Element extends Node> = InferWith<Element, undefined>
export type AsNullable<Element extends Node> = InferWith<Element, null>

export type InferWithout<Element extends Node, Value> = Omit<Element, 'infer'> & {
    infer: Exclude<Element extends { infer: unknown } ? Element['infer'] : Element, Value>
}

export type AsRequired<Element extends Node> = InferWithout<Element, undefined>
