import type { Node } from './node.js'

export type Intrinsic<Element extends Node> = Element extends { intrinsic: unknown } ? Element['intrinsic'] : Element
