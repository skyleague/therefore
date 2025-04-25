import { isDefined } from '@skyleague/axioms'
import type CodeBlockWriter from 'code-block-writer'
import type { Node } from '../../../cst/node.js'
import { $object, type ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType, StorageShapeType } from '../entity.js'
import { FormattedOperand, type ValueOperand } from '../expressions/attributes.js'
import { type ConditionBuilder, conditionExpression } from '../expressions/condition.js'
import { type ProjectionBuilder, projectionExpression } from '../expressions/projection.js'
import { type UpdateBuilder, updateExpression } from '../expressions/update.js'
import { isReservedWord } from '../reserved.js'
import type { IndexDefinition } from '../table.js'

export class DynamodbCommandSchemaBuilder<
    Entity extends ObjectType = ObjectType,
    BaseShape extends ObjectType = ObjectType,
    const Pk extends keyof Entity['shape'] & string = keyof Entity['shape'] & string,
    const Sk extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const CreatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const UpdatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const EntityType extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined = Record<
        string,
        IndexDefinition<string, string[], string | undefined>
    >,
    const AttributeFormatters extends Record<string, (keys: Record<string, string>) => string> | undefined =
        | Record<string, (keys: Record<string, string>) => string>
        | undefined,
> {
    public readonly entity: DynamoDbEntityType<
        Entity,
        BaseShape,
        Pk,
        Sk,
        CreatedAt,
        UpdatedAt,
        EntityType,
        Indexes,
        AttributeFormatters
    >

    public readonly keySchema: Record<string, FormattedOperand> | undefined
    public readonly condition: ReturnType<typeof conditionExpression> | undefined
    public readonly update: ReturnType<typeof updateExpression> | undefined
    public readonly projection: ReturnType<typeof projectionExpression> | undefined
    public readonly keyCondition: ReturnType<typeof conditionExpression> | undefined
    public readonly filter: ReturnType<typeof conditionExpression> | undefined

    public readonly indexKey: string | undefined
    public _usedAttributes: Set<keyof StorageShapeType<Entity, BaseShape>['shape']> = new Set()

    public _attributeNames: Record<string, string> = {}
    public _attributeValues: Record<string, string> = {}
    public _attributeConstValues: Record<string, unknown> = {}

    public _args: Record<string, Node> = {}

    public _createArguments: ((self: typeof this) => ObjectType<any> | undefined) | undefined
    public _createResult: ((self: typeof this) => ObjectType<any> | undefined) | undefined

    public constructor({
        entity,
        inferKeySchema = false,
        condition,
        update,
        projection,
        keyCondition,
        filter,
        createArguments,
        createResult,
        indexKey,
    }: {
        entity: DynamoDbEntityType<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes, AttributeFormatters>
        inferKeySchema?: boolean
        condition?: ConditionBuilder<StorageShapeType<Entity, BaseShape>> | undefined
        update?: UpdateBuilder<StorageShapeType<Entity, BaseShape>> | undefined
        projection?: ProjectionBuilder<StorageShapeType<Entity, BaseShape>> | undefined
        keyCondition?: ConditionBuilder<StorageShapeType<Entity, BaseShape>> | undefined
        filter?: ConditionBuilder<StorageShapeType<Entity, BaseShape>> | undefined
        createArguments?:
            | ((
                  self: DynamodbCommandSchemaBuilder<
                      Entity,
                      BaseShape,
                      Pk,
                      Sk,
                      CreatedAt,
                      UpdatedAt,
                      EntityType,
                      Indexes,
                      AttributeFormatters
                  >,
              ) => ObjectType<any> | undefined)
            | undefined
        createResult?:
            | ((
                  self: DynamodbCommandSchemaBuilder<
                      Entity,
                      BaseShape,
                      Pk,
                      Sk,
                      CreatedAt,
                      UpdatedAt,
                      EntityType,
                      Indexes,
                      AttributeFormatters
                  >,
              ) => ObjectType<any> | undefined)
            | undefined
        indexKey?: string | undefined
    }) {
        this.entity = entity
        this.keySchema = inferKeySchema ? this.schemaKeyOperands : undefined

        this.condition = condition ? conditionExpression({ build: condition, schema: this }) : undefined
        this.update = update ? updateExpression({ entity, build: update, schema: this }) : undefined
        this.projection = projection ? projectionExpression({ build: projection, schema: this }) : undefined
        this.keyCondition = keyCondition ? conditionExpression({ build: keyCondition, schema: this }) : undefined
        this.filter = filter ? conditionExpression({ build: filter, schema: this }) : undefined
        this._createArguments = createArguments
        this._createResult = createResult
        this.indexKey = indexKey
    }

    /**
     * @deprecated
     */
    public attributeValue({ key }: { key: string }): string {
        this._attributeValues[key] = `:${key}`
        return this._attributeValues[key]
    }

    /**
     * @deprecated
     */
    public attributeName({ key }: { key: string }): string {
        let path = key
        // see note https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html#Expressions.ExpressionAttributeNames.RepeatingAttributeNames
        if (key.includes('.') || key.includes('-')) {
            path = this._attributeNames[path] ??= `#${key.replaceAll('.', '_').replaceAll('-', '_')}`
        } else if (isReservedWord(key)) {
            path = this._attributeNames[path] ??= `#${key}`
        }
        return path
    }

    // /**
    //  * @deprecated
    //  */
    // public referenceAttribute(value: ValueOperand) {
    //     // this._usedAttributes.add(value.shapeKey)
    //     return value.image
    // }

    public setArgumentValue({ key, operand, value }: { key: string; operand: ValueOperand; value: Node }) {
        this._args[key] = value
        return operand.image
    }

    public referenceValue({ inputKey, value }: { value: unknown; inputKey?: string | undefined }): string {
        const constValue =
            value instanceof Function
                ? `(${value.toString()})()`
                : value instanceof FormattedOperand
                  ? value.image
                  : JSON.stringify(value)
        const [existing] = Object.entries(this._attributeConstValues).find(([, v]) => v === constValue) ?? []
        if (existing) {
            return existing
        }
        const base = `:${inputKey ?? 'const'}`
        let image = `${base}0`
        let i = 0
        while (image in this._attributeConstValues) {
            image = `${base}${++i}`
        }

        this._attributeConstValues[image] = constValue
        return image
    }

    public get definedSchemaKeys() {
        return [this.entity.table.definition.pk, this.entity.table.definition.sk, ...this.indexDefinedSchemaKeys].filter(
            isDefined,
        )
    }

    public get indexDefinedSchemaKeys() {
        return Object.values(this.entity.table.definition.indexes ?? {})
            .flatMap((i: any) => [i.pk, i.sk])
            .filter(isDefined)
    }

    public get schemaKeyOperands(): Record<string, FormattedOperand> {
        return Object.fromEntries(this.definedSchemaKeys.map((k) => [k, this.entity.asFormattedOperand(k)]))
    }

    public get schemaKeyInputFields(): string[] {
        return Object.values(this.schemaKeyOperands).flatMap((k) => k._inputKeys)
    }

    public '~arguments': ObjectType<any> | undefined = undefined
    public get arguments() {
        if (this['~arguments'] !== undefined) {
            return this['~arguments']
        }
        const createArguments =
            this._createArguments ??
            (() => {
                let base = undefined
                if (this.keySchema !== undefined) {
                    const usedKeyArguments = this.schemaKeyInputFields
                    base = this.entity.storageShape
                        .pick(...usedKeyArguments) //, ...this._usedAttributes)
                        .required(...usedKeyArguments)
                }

                if (Object.values(this._args).length > 0) {
                    base = base?.merge($object(this._args)) ?? $object(this._args)
                }

                // if (this._usedAttributes.size > 0) {
                //     const picked = this.entity.storageShape.pick(...Array.from(this._usedAttributes))

                //     return Object.values(this._args).length > 0 ? $object(this._args) : picked
                // }
                return base
            })
        const args = createArguments(this)

        if (args !== undefined) {
            args._transform ??= {}
            args._transform['type:source'] = (name) => `${name}Input`
            args._transform['value:source'] = (name) => `${name}Input`
        }

        this['~arguments'] = args

        return args
    }

    public '~result': ObjectType<any> | undefined = undefined
    public get result() {
        if (this['~result'] !== undefined) {
            return this['~result']
        }

        const createResult =
            this._createResult ??
            (() => {
                if (this.projection?.result !== undefined) {
                    return this.projection.result
                }
                if (this.indexKey !== undefined) {
                    const selectedIndex = this.entity.table.definition.indexes?.[this.indexKey]
                    if (selectedIndex === undefined || selectedIndex.projectionType === 'ALL') {
                        return undefined
                    }
                    const { pk: _pk, sk: _sk } = this.entity.table.definition
                    const { pk, sk } = selectedIndex
                    const keys = [pk, sk, _pk, _sk]
                    if (selectedIndex.projectionType === 'INCLUDE') {
                        keys.push(...selectedIndex.nonKeyAttributes)
                    }
                    return this.entity.storageShape.pick(...new Set(keys.filter(isDefined)))
                }

                return undefined
            })

        const result = createResult(this)

        if (result !== undefined) {
            result._transform ??= {}
            result._transform['type:source'] = (name) => `${name}Result`
            result._transform['value:source'] = (name) => `${name}Result`
        }

        this['~result'] = result

        return result
    }

    public writeCommand({
        writer,
        commandOptions,
        writeKey = true,
    }: { writer: CodeBlockWriter; commandOptions: Record<string, unknown>; writeKey?: boolean }) {
        if (writeKey && this.keySchema !== undefined) {
            writer
                .writeLine('Key: ')
                .inlineBlock(() => {
                    for (const [key, value] of Object.entries(this.keySchema ?? {})) {
                        writer.write(`${key}: ${value.image},`)
                    }
                })
                .write(',')
        }

        if (this.keyCondition !== undefined) {
            writer.writeLine(`KeyConditionExpression: ${JSON.stringify(this.keyCondition.expression)},`)
        }

        if (this.update !== undefined) {
            writer.writeLine(`UpdateExpression: ${JSON.stringify(this.update.expression)},`)
        }
        if (this.condition !== undefined) {
            writer.writeLine(`ConditionExpression: ${JSON.stringify(this.condition.expression)},`)
        }
        if (this.filter !== undefined) {
            writer.writeLine(`FilterExpression: ${JSON.stringify(this.filter.expression)},`)
        }

        if (this.projection !== undefined) {
            writer.write(`ProjectionExpression: ${JSON.stringify(this.projection.stored)},`)
        }

        if (Object.keys(this._attributeNames).length > 0) {
            writer
                .writeLine('ExpressionAttributeNames: ')
                .block(() => {
                    for (const [input, alias] of Object.entries(this._attributeNames)) {
                        writer.writeLine(`${JSON.stringify(alias)}: ${JSON.stringify(input)},`)
                    }
                })
                .write(',')
        }

        if (Object.keys(this._attributeValues).length > 0 || Object.keys(this._attributeConstValues).length > 0) {
            writer
                .writeLine('ExpressionAttributeValues: ')
                .block(() => {
                    for (const [input, alias] of Object.entries(this._attributeValues)) {
                        writer.writeLine(`${JSON.stringify(alias)}: ${input},`)
                    }
                    for (const [alias, input] of Object.entries(this._attributeConstValues)) {
                        writer.writeLine(`${JSON.stringify(alias)}: ${input},`)
                    }
                })
                .write(',')
        }

        const filteredOptions = Object.entries(commandOptions ?? {}).filter(([_, v]) => v !== undefined)
        if (filteredOptions.length > 0) {
            writer.writeLine('// Extra options')
            for (const [key, value] of filteredOptions) {
                writer.writeLine(`${key}: ${typeof value === 'string' ? JSON.stringify(value) : value},`)
            }
        }
    }
}
