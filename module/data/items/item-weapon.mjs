import GodboundItem from './item-item.mjs'

const WEAPON_DIE_SIZE = {
    unarmed: 2,
    light: 6,
    medium: 8,
    heavy: 10,
    ranged1h: 6,
    ranged2h: 8,
}

export default class GodboundWeapon extends GodboundItem {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()
        schema.attribute = new fields.StringField({
            initial: 'str',
            choices: CONFIG.GODBOUND.attributes,
        })
        schema.weaponType = new fields.StringField({
            initial: 'unarmed',
            choices: CONFIG.GODBOUND.WeaponTypes,
        })
        schema.damageDie = new fields.NumberField({
            ...requiredInteger,
            initial: 2,
        })
        schema.straightDamage = new fields.BooleanField({
            required: true,
            initial: false,
        })
        return schema
    }

    prepareDerivedData() {
        super.prepareDerivedData()
        const weaponDie = WEAPON_DIE_SIZE[this.weaponType]
        // If the weapon type is not custom and the damage doesn't match the weapon die, update it
        if (weaponDie && weaponDie != this.damageDie) {
            this.damageDie = weaponDie
        }
        this.isCustomType = this.type == 'custom'
        this.roll.diceBonus = `+@${this.attribute}.mod`
        this.formula = `${this.roll.diceNum}${this.roll.diceSize}${this.roll.diceBonus}`
    }
}
