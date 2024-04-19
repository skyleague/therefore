/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import type { SchemaOptions } from '../base.js'

import { type ConstExpr, evaluate } from '@skyleague/axioms'

export type RefOptions = object

export class RefType<Reference extends Node = Node> extends Node {
    public override type = 'ref' as const
    public override children: [Node]

    public options: RefOptions = {}
    public declare infer: Reference['infer']
    public declare intrinsic: Intrinsic<Reference>

    public constructor(reference: ConstExpr<Reference>, options: SchemaOptions<RefOptions, Reference['infer']>) {
        super(options)
        this.options = options

        // we are lying to typescript here, but it's fine
        // there expression will be evaluated in the prepass, and errors hard if it's not
        this.children = [reference as Node]
    }

    public override hooks = {
        onLoad: [
            (self: Node): void => {
                self.children = self.children?.map(evaluate) as [Node]
            },
        ],
        onGenerate: [
            ({ children }: Node): void => {
                const [reference] = children ?? []
                if (reference !== undefined && reference.sourcePath === undefined) {
                    // this reference was not exported on its own
                    // so we just call it local if has no name
                    reference.name ??= 'local'
                }
            },
        ],
    }

    public static from<Reference extends Node>(
        ref: ConstExpr<Reference>,
        options: SchemaOptions<RefOptions>,
    ): RefType<Intrinsic<Reference>> {
        type IntrinsicType = Intrinsic<Reference>
        return new RefType<IntrinsicType>(ref as ConstExpr<IntrinsicType>, options)
    }
}

export interface RefType extends Node, NodeTrait {}
