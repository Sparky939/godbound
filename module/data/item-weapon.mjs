import GodboundItem from './item-item.mjs'

const WEAPON_DIE_SIZE = {
    // TODO: Weapon die size
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

        schema.weaponDieSize = new fields.NumberField({...requiredInteger, initial: 2, choices: [2, 4, 6, 8, 10, 12]})
        return schema
    }
}
