import { GODBOUND } from '../../helpers/config.mjs'
import GodboundItemBase from './base-item.mjs'

/**
 * @param {string} description
 * @param {object} passive
 * @param {string} passive.name // The name of the passive ability
 * @param {string} passive.description // The description of the passive ability
 * @param {boolean} passive.show // Whether to show the passive ability
 * @param {array} costs
 * @param {object} cost
 * @param {number} cost.amount
 * @param {string} cost.duration.type // "constant", "toggle", "scene", "round", "day"
 * @param {number} cost.duration.value // number of duration.type units
 */

export default class GodboundWord extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = super.defineSchema()
        const requiredInteger = {
            required: true,
            integer: true,
        }
        schema.effort = new fields.NumberField({
            ...requiredInteger,
            default: 0,
            inital: 0,
        })
        schema.effortOfTheWord = new fields.BooleanField({
            required: true,
            initial: false,
        })
        schema.influenceOfTheWord = new fields.BooleanField({
            required: true,
            initial: false,
        })
        schema.excellenceOfTheWord = new fields.BooleanField({
            required: true,
            initial: false,
        })
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
            show: new fields.BooleanField({
                required: true,
                initial: true,
            }),
            gifts: new fields.ArrayField(
                new fields.SchemaField({
                    name: new fields.StringField({
                        required: true,
                    }),
                    description: new fields.StringField({
                        required: true,
                    }),
                    power: new fields.StringField({
                        required: true,
                        options: Object.keys(GODBOUND.gifts.power),
                    }),
                })
            ),
        })
        return schema
    }

    prepareDerivedData() {
        super.prepareDerivedData()
        this.effort = this.effort ?? 0
    }
}
