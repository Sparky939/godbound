import GodboundDataModel from '../base-model.mjs'

export default class GodboundActorBase extends GodboundDataModel {
    static defineSchema() {
        const fields = foundry.data.fields
        const schema = {}
        schema.biography = new fields.StringField({
            required: true,
            blank: true,
        }) // equivalent to passing ({initial: ""}) for StringFields

        return schema
    }
}
