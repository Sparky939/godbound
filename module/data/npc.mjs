import GodboundActorBase from "./actor-base.mjs";

export default class GodboundNPC extends GodboundActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.resources.hitdice = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1 })
    });

    return schema
  }

  prepareDerivedData() {
    this.xp = this.cr * this.cr * 100;
  }
}