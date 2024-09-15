import GodboundItemBase from './base-item.mjs'

/**
 * @param {string} description
 */

export default class GodboundFact extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = super.defineSchema()

        schema.description = new fields.StringField({
            type: String,
            required: true,
            blank: true,
        })

        return schema
    }
}
