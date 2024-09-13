import GodboundActorBase from "./base-actor.mjs";

/**
 * @param {object} resources
 * @param {object} resources.hd
 * @param {number} resources.hd.value
 * @param {number} resources.hd.max
 * @param {object} resources.effort
 * @param {number} resources.effort.value
 * @param {number} resources.effort.max
 * @param {number} attributes.highSave
 * @param {number} attributes.lowSave
 * @param {number} attributes.ac
 * @param {string} attributes.move
 * @param {object} details
 * @param {string} details.description
 * @param {string} details.goal
 */

export default class GodboundNPC extends GodboundActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.resources = new fields.SchemaField({
      hd: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      effort: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
    });

    schema.attributes = new fields.SchemaField({
      highSave: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      lowSave: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      ac: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      move: new fields.StringField({ initial: "30 ft." }),
    });

    schema.details = new fields.SchemaField({
      description: new fields.StringField({ initial: "" }),
      goal: new fields.StringField({ initial: "" }),
    })

    return schema
  }

  prepareDerivedData() {}

  getRollData() {
    const data = {};

    data.highsave = this.data.attributes.highSave;
    data.lowsave = this.data.attributes.lowSave;
    data.ac = this.data.attributes.ac;

    return data;
  }
}