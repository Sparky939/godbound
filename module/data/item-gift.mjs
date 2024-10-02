import GodboundItem from './item-item.mjs'

export default class GodboundArmour extends GodboundItem {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = super.defineSchema()
        schema.word = new fields.StringField({ initial: ""})

        return schema
    }
}
