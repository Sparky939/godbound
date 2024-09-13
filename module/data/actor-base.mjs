export default class GodboundActorBase extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    // const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // schema.resources = new fields.SchemaField({
    //   effort: new fields.SchemaField({
    //     value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    //   }),
    // })
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    return schema;
  }
}