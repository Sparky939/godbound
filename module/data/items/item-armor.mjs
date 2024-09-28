import GodboundItem from './item-item.mjs'
import { GODBOUND } from '../../helpers/config.mjs'

export default class GodboundArmor extends GodboundItem {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()
        schema.quantity = new fields.NumberField({
            ...requiredInteger,
            initial: 1,
            max: 1,
            min: 1,
        })

        schema.type = new fields.StringField({
            initial: 'none',
            choices: Object.keys(GODBOUND.armorTypes),
        })
        schema.value = new fields.NumberField({ initial: 9 })
        schema.worn = new fields.BooleanField({ initial: false })
    }

    prepareDerivedData() {
        // TODO: Maybe allow override from settings?
        this.types = Object.keys(GODBOUND.armorTypes).map((k) => ({
            key: k,
            label: GODBOUND.armorTypes[k],
        }))
    }

    prepareValue() {
        console.log('armor-parent', this.parent)
        // this.type = this.parent.actor
    }
}
