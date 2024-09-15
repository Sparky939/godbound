import GodboundItemBase from './base-item.mjs'

/**
 * @param {string} description
 * @param {object} cost
 * @param {number} cost.dominion
 * @param {number} cost.influence
 */

export default class GodboundProject extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = {}

        schema.description = new fields.StringField({
            required: true,
            blank: true,
        })
        schema.cost = new fields.SchemaField({
            dominion: new fields.NumberField({
                ...requiredInteger,
                initial: 0,
            }),
            influence: new fields.NumberField({
                ...requiredInteger,
                initial: 0,
            }),
        })

        return schema
    }
}
