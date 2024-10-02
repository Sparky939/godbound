import GodboundItem from './item-item.mjs'

export default class GodboundGift extends GodboundItem {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = super.defineSchema()
        schema.word = new fields.StringField({ initial: ""})

        return schema
    }
}
