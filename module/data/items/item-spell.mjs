import GodboundItemBase from './base-item.mjs'
import { GODBOUND } from '../../helpers/config.mjs'

/**
 * @param {string} description
 * @param {string} level // innvocation level "Apprentice", "Adept", "Master", "Archmage"
 */

export default class GodboundSpell extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = super.defineSchema()

        schema.level = new fields.StringField({
            type: String,
            required: true,
            default: 'Apprentice',
            options: Object.values(GODBOUND.spells.level),
        })

        return schema
    }
}
