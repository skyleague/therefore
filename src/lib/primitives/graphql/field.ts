import { type GenericOutput, type TypescriptOutput, isNode } from '../../cst/cst.js'
import { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { Hooks } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'
import type { ObjectType } from '../object/object.js'
import { $ref } from '../ref/ref.js'
import type { RefType } from '../ref/type.js'

import { memoize } from '@skyleague/axioms'

export interface FieldOptions {
    type: Node
    args?: ObjectType | Record<string, RefType> | undefined
}

export class GraphqlFieldType extends NodeTrait {
    public override children: Node[]
    public override type = 'graphql:field' as const
    public args: ObjectType | Record<string, RefType> | undefined
    public returnType: Node

    public constructor({ type, args, ...options }: SchemaOptions<FieldOptions>) {
        super(options)
        this.args = args
        this.returnType = type
        this.children = [...this.argsChildren().map(([, child]) => child), this.returnType]
        this.connections = [...this.argsChildren().map(([, child]) => child), this.returnType]
    }

    public argsChildren = memoize(() => {
        return this.args !== undefined
            ? isNode(this.args)
                ? [['args', $ref(this.args)] as const]
                : Object.entries(this.args).map(([name, arg]) => {
                      return [name, arg] as const
                  })
            : []
    })

    public override hooks: Partial<Hooks> = {
        onLoad: [
            () => {
                for (const [, arg] of this.argsChildren()) {
                    arg.transform ??= {}
                    arg.transform.symbolName ??= (name) => {
                        return `${name}Args`
                    }
                }
                this.returnType.transform ??= {}
                this.returnType.transform.symbolName ??= (name) => {
                    return `${name}Type`
                }
            },
        ],
    }
    public override get output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'typescript',
                definition: (node, { declare, reference }) => {
                    if (this.args !== undefined) {
                        const argument = this.argsChildren()
                            .map(([name, arg]) => `${name}: ${reference(arg)}`)
                            .join(', ')
                        return `${declare('type', node)} = (${argument}) => ${reference(this.returnType)}`
                    }
                    return `${declare('type', node)} = () => ${reference(this.returnType)}`
                },
                content: false,
            },
        ]
    }
}

export function $field(options: SchemaOptions<FieldOptions>): GraphqlFieldType {
    return new GraphqlFieldType(options)
}
