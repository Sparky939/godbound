import GodboundItem from './item-item.mjs'

const ARMOUR_VALUE = {
    None: 9,
    Light: 7,
    Medium: 5,
    Heavy: 3,
}

export default class GodboundArmour extends GodboundItem {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()

        schema.baseArmour = new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: 0,
        })
        schema.type = new fields.StringField({
            initial: 'None',
            choices: CONFIG.GODBOUND.ArmourTypes,
        })
        schema.worn = new fields.BooleanField({ initial: false })
        schema.hardinessPenalty = new fields.BooleanField({ initial: false })
        schema.evasionPenalty = new fields.BooleanField({ initial: false })
        schema.spiritPenalty = new fields.BooleanField({ initial: false })
        return schema
    }

    prepareDerivedData() {
        this.baseArmour = ARMOUR_VALUE[this.type];
    }
}
