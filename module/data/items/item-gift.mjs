import { getGlobalWords, GODBOUND } from '../../helpers/config.mjs'
import GodboundItemBase from './base-item.mjs'

/**
 * @param {string} description
 * @param {string} word
 * @param {object} power // "lesser", "greater"
 * @param {string} power.value
 * @param {string} power.label
 * @param {object} type // "passive", "instant", "turn", "action"
 * @param {string} type.value
 * @param {string} type.label
 * @param {array} effects
 */

export default class GodboundGift extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = super.defineSchema()
        const requiredInteger = {
            required: true,
            integer: true,
        }

        schema.word = new fields.SchemaField({
            id: new fields.StringField({
                required: true,
            }),
            name: new fields.StringField({
                required: true,
                initial: '',
            }),
        })

        schema.power = new fields.SchemaField({
            value: new fields.StringField({
                required: true,
                options: Object.keys(GODBOUND.gifts.power),
                initial: 'lesser',
            }),
        })

        schema.type = new fields.SchemaField({
            value: new fields.StringField({
                required: true,
                options: Object.keys(GODBOUND.gifts.type),
                initial: 'action',
            }),
        })
        schema.effort = new fields.NumberField({
            ...requiredInteger,
            default: 0,
            initial: 0,
        })

        schema.effortEffects = new fields.ArrayField(
            new fields.SchemaField({
                description: new fields.StringField({
                    required: true,
                    default: '',
                }),
                amount: new fields.NumberField({
                    required: true,
                    initial: 0,
                }),
                active: new fields.BooleanField({ default: false }),
                effects: new fields.ArrayField(
                    new fields.SchemaField({
                        field: new fields.StringField({
                            required: true,
                        }),
                        modifierType: new fields.StringField({
                            required: true,
                            choices: ['override', 'add', 'multiply'],
                        }),
                        valueType: new fields.StringField({
                            required: true,
                            choices: [
                                'number',
                                'string',
                                'boolean',
                                'array',
                                'object',
                            ],
                        }),
                        value: new fields.StringField({
                            required: true,
                        }),
                    })
                ),
                duration: new fields.SchemaField({
                    type: new fields.StringField({
                        required: true,
                        choices: [
                            'constant',
                            'toggle',
                            'scene',
                            'round',
                            'day',
                        ],
                    }),
                    value: new fields.NumberField({
                        required: true,
                        initial: 0,
                    }),
                }),
            })
        )

        return schema
    }

    prepareDerivedData() {
        super.prepareDerivedData()
    }
}
