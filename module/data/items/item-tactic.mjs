import GodboundItem from './item-item.mjs'

export default class GodboundTactic extends GodboundItem {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()
        schema.available = new fields.BooleanField({
            initial: true,
        })
        schema.weight = new fields.NumberField({
            ...requiredInteger,
            initial: 1,
        })
        return schema
    }
}
