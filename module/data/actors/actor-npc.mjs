import GodboundActorBase from './base-actor.mjs'

/**
 * @param {object} resources
 * @param {object} resources.hd
 * @param {number} resources.hd.value
 * @param {number} resources.hd.max
 * @param {object} resources.effort
 * @param {number} resources.effort.value
 * @param {number} resources.effort.max
 * @param {number} defence.highSave
 * @param {number} defence.lowSave
 * @param {number} defence.ac
 * @param {object} details
 * @param {string} details.move
 * @param {string} details.description
 * @param {string} details.goal
 */

export default class GodboundNPC extends GodboundActorBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()

        schema.resources = new fields.SchemaField({
            hd: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            }),
            effort: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            }),
        })

        schema.defence = new fields.SchemaField({
            highSave: new fields.NumberField({
                ...requiredInteger,
                initial: 12,
            }),
            lowSave: new fields.NumberField({
                ...requiredInteger,
                initial: 15,
            }),
            ac: new fields.NumberField({ ...requiredInteger, initial: 9 }),
        })

        schema.details = new fields.SchemaField({
            description: new fields.StringField({ initial: '' }),
            goal: new fields.StringField({ initial: '' }),
            move: new fields.StringField({ initial: '30 ft.' }),
        })

        return schema
    }

    prepareDerivedData() {}

    getRollData() {
        const data = {}

        data.highsave = this.defence.highSave
        data.lowsave = this.defence.lowSave
        data.ac = this.defence.ac

        return data
    }
}
