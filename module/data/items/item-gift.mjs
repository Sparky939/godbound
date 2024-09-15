import { GODBOUND } from '../../helpers/config.mjs'
import GodboundItemBase from './base-item.mjs'

/**
 * @param {string} description
 * @param {object} word
 * @param {string} word.value
 * @param {string} word.label
 * @param {object} power // "lesser", "greater"
 * @param {string} power.value
 * @param {string} power.label
 * @param {object} type // "passive", "instant", "turn", "action"
 * @param {string} type.value
 * @param {string} type.label
 */

export default class GodboundGift extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = {}

        schema.word = new fields.SchemaField({
            value: new fields.StringField({
                required: true,
                options: Object.keys(GODBOUND.words),
            }),
            label: new fields.StringField({
                required: true,
                default: '',
            }),
        })

        schema.power = new fields.SchemaField({
            value: new fields.StringField({
                required: true,
                options: Object.keys(GODBOUND.gifts.power),
            }),
            label: new fields.StringField({
                required: true,
                default: '',
            }),
        })

        schema.type = new fields.SchemaField({
            value: new fields.StringField({
                required: true,
                options: Object.keys(GODBOUND.gifts.type),
            }),
            label: new fields.StringField({
                required: true,
                default: '',
            }),
        })
        return schema
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.word.label = GODBOUND.words[this.word.value] ?? "";
        this.power.label = GODBOUND.gifts.power[this.power.value] ?? "";
        this.type.label = GODBOUND.gifts.type[this.type.value] ?? "";
    }
}
