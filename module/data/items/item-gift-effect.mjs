import GodboundItemBase from './base-item.mjs'

/**
 * @param {string} description
 * @param {number} cost
 * @param {string} type
 * @param {object} duration
 * @param {number} duration.value
 * @param {string} duration.type
 */

export default class GodboundGiftEffect extends GodboundItemBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()

        schema.cost = new fields.NumberField({
            ...requiredInteger,
            initial: 0,
        })
        schema.type = new fields.StringField({
            required: true,
            options: ['passive', 'commit', 'duration'],
        })
        schema.duration = new fields.SchemaField({
            value: new fields.NumberField({
                ...requiredInteger,
                initial: 0,
            }),
            unit: new fields.StringField({
                required: true,
                options: [
                    'round',
                    'minute',
                    'hour',
                    'day',
                    'week',
                    'month',
                    'year',
                ],
            }),
        })

        return schema
    }
}
