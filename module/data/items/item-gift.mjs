import { GODBOUND } from '../../helpers/config.mjs'
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
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()

        schema.word = new fields.StringField({
            required: true,
            options: game.settings
                .get('godbound', 'words')
                .split(',')
                .map((str) => String(str).trim()),
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

        schema.effortEffects = new fields.ArrayField(
            fields.SchemaField({
                icon: new fields.FilePathField({
                    required: false,
                }),
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
        this.words = game.settings
            .get('godbound', 'words')
            .split(',')
            .reduce((acc, str) => {
                const word = String(str).trim()
                acc[word] = word
                return acc
            }, {})
        this.power.label = GODBOUND.gifts.power[this.power.value] ?? ''
        this.type.label = GODBOUND.gifts.type[this.type.value] ?? ''
    }

    createGiftEffect(idx) {
        const item = new GodboundGiftEffect(this.effects[idx], this)
        this.parent.actor.createEmbeddedDocuments('Item', [item])
    }
}
