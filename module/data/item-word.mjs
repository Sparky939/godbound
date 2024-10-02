import GodboundItem from './item-item.mjs'

export default class GodboundWord extends GodboundItem {
    static defineSchema() {
        // const fields = foundry.data.fields
        // const requiredInteger = {
        //     required: true,
        //     nullable: false,
        //     integer: true,
        // }
        const schema = super.defineSchema()

        return schema
    }
}
