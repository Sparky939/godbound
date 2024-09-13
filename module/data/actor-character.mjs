import GodboundActorBase from "./base-actor.mjs";
import CONFIG from "../helpers/config.mjs";
import {ATTRIBUTE_MODIFIERS} from "../helpers/tables.mjs";

export default class GodboundCharacter extends GodboundActorBase {

  /**
  @property {object} attributes
  @property {number} attributes.level
  @property {object} attributes.str/dex/con/wis/int/cha
  @property {number} attributes.<attribute score abbr>.value
  @property {number} attributes.<attribute score abbr>.mod
  @property {number} attributes.<attribute score abbr>.label
  */

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.NumberField({ ...requiredInteger, initial: 1 })
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.attributes = new fields.SchemaField(Object.keys(CONFIG.GODBOUND.abilities).reduce((obj, attribute) => {
      obj[attribute] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 3, max: 19 }),
      });
      return obj;
    }, {}));

    return schema;
  }

  prepareDerivedData() {
    // Loop through attribute scores, and add their modifiers to our sheet output.
    for (const key in this.attributes) {
      // Calculate the modifier using d20 rules.
      this.attributes[key].mod = ATTRIBUTE_MODIFIERS.find(attr => this.attribute[key].value >= attr.min && this.attribute[key].value <= attr.max);
      // Handle attribute label localization.
      this.attributes[key].label = game.i18n.localize(CONFIG.GODBOUND.attributes[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the attribute scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.attributes) {
      for (let [k,v] of Object.entries(this.attributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level;

    return data
  }
}
