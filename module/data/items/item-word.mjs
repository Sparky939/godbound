import GodboundItemBase from './base-item.mjs'

/**
 * @param {string} description
 * @param {object} passive
 * @param {string} passive.name // The name of the passive ability
 * @param {string} passive.description // The description of the passive ability
 */

export default class GodboundWord extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = super.defineSchema()

        schema.passive = new fields.SchemaField({
            name: new fields.StringField({
                type: String,
                required: true,
                blank: true,
            }),
            description: new fields.StringField({
                type: String,
                required: true,
                blank: true,
            }),
        })
        return schema
    }
}
