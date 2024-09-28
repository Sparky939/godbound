import { GODBOUND } from '../../helpers/config.mjs'
import AttackField from '../activity/attack-data.mjs'
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
 * @param {array} attacks
 * @param {AttackField[]} attacks
 * @param {array} defenses
 * @param {object} defenses<number>
 * @param {string} defenses<number>.name
 * @param {string} defenses<number>.type (immunity | ac)
 * @param {array} bonuses
 * @param {object} bonuses<number>
 * @param {string} bonuses<number>.target (health | effort | influence)
 * @param {boolean} bonuses<number>.scaling (true - level | false - flat)
 * @param {string} bonuses<number>.value
 * @param {array} effects
 * @param {object} effects<number>
 * @param {string} effects<number>.name
 * @param {number} effects<number>.cost
 * @param {string} effects<number>.commitDuration (day | scene | flex)
 */

export default class GodboundGift extends GodboundItemBase {
    static defineSchema() {
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

        // Description of the gift
        schema.description = new fields.StringField({ required: true })

        // Define multiple activations with different effects on Effort
        schema.activations = new fields.ArrayField(
            new fields.SchemaField({
                type: new fields.StringField({
                    required: true,
                    choices: ['flexible', 'scene', 'day'],
                }), // Type of activation
                effort: new fields.SchemaField({
                    amount: new fields.NumberField({ initial: 1 }),
                }),
                effects: new fields.ArrayField(
                    new fields.SchemaField({
                        id: new fields.StringField({}),
                    })
                ),
            })
        )

        // Define passive effects
        schema.passiveEffects = new fields.ArrayField(
            new fields.SchemaField({
                target: new fields.StringField({ required: true }), // Target attribute
                modifier: new fields.MixedField({ required: true }), // Static or dynamic modifier
            })
        )
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
