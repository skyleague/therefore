/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import type { SchemaOptions } from '../base.js'

import { type ConstExpr, evaluate } from '@skyleague/axioms'

export type RefOptions = object

export class RefType<Reference extends Node = Node> extends Node {
    public override _type = 'ref' as const
    public override _children: [Node]

    public _options: RefOptions = {}
    public declare infer: Reference['infer']
    public declare intrinsic: Intrinsic<Reference>

    public constructor(reference: ConstExpr<Reference>, options: SchemaOptions<RefOptions, Reference['infer']>) {
        super(options)
        this._options = options

        // we are lying to typescript here, but it's fine
        // there expression will be evaluated in the prepass, and errors hard if it's not
        this._children = [reference as Node]
    }

    public override _hooks = {
        onLoad: [
            (self: Node): void => {
                self._children = self._children?.map(evaluate) as [Node]
            },
        ],
        onGenerate: [
            ({ _children: children }: Node): void => {
                const [reference] = children ?? []
                if (reference !== undefined && reference._sourcePath === undefined) {
                    // this reference was not exported on its own
                    // so we just call it local if has no name
                    reference._name ??= 'local'
                }
            },
        ],
    }

    public get item(): Reference {
        return this._children[0] as Reference
    }

    public static _from<Reference extends Node>(
        ref: ConstExpr<Reference>,
        options: SchemaOptions<RefOptions>,
    ): RefType<Intrinsic<Reference>> {
        type IntrinsicType = Intrinsic<Reference>
        return new RefType<IntrinsicType>(ref as ConstExpr<IntrinsicType>, options)
    }
}

export interface RefType extends Node, NodeTrait {}
