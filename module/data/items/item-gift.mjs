import { GODBOUND } from '../../helpers/config.mjs'
import GodboundItemBase from './base-item.mjs'

/**
 * @param {string} description
 * @param {string} word
 * @param {string} power // "lesser", "greater"
 * @param {string} type // "passive", "instant", "turn", "action"
 */

export default class GodboundGift extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = {}

        schema.word = new fields.StringField({
            required: true,
            options: Object.keys(GODBOUND.words),
        })
        schema.type = new fields.StringField({
            required: true,
            options: ['passive', 'instant', 'turn', 'action'],
        })
        schema.power = new fields.StringField({
            required: true,
            options: ['lesser', 'greater'],
        })

        return schema
    }
}
