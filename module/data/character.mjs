import { ATTRIBUTE_MODIFIERS, LEVEL_REQUIREMENTS } from "../helpers/tables.mjs";
import GodboundActorBase from "./actor-base.mjs";

export default class GodboundCharacter extends GodboundActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.resources.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 8, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 8 })
    });
    schema.resources.influence = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1 })
    });
    schema.resources.dominion = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1 })
    });

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over attribute names and create a new SchemaField for each.
    schema.attributes = new fields.SchemaField(Object.keys(CONFIG.GODBOUND.attributes).reduce((obj, attribute) => {
      obj[attribute] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        label: new fields.StringField({ required: true, blank: true })
      });
      return obj;
    }, {}));

    return schema;
  }

  prepareDerivedData() {
    // Loop through attribute scores, and add their modifiers to our sheet output.
    for (const key in this.attributes) {
      // Calculate the modifier using Godbound modifier table.
      this.attributes[key].mod = ATTRIBUTE_MODIFIERS.find(opt => this.attribtues[key].value <= opt.max && this.attribtues[key].value >= opt.min).mod;
      // Handle attribute label localization.
      this.attributes[key].label = game.i18n.localize(CONFIG.GODBOUND.attributes[key]) ?? key;
    }
    // // Use the actor's experience and spent dominion to determine their level.
    // this.level = LEVEL_REQUIREMENTS.findIndex(opt => this.details.xp >= opt.xp && this.resources.dominon.spent >= opt.dp) + 1;
    // // Use the actor's level to determine their attack bonus
    // this.baseAttackBonus = this.level;
    // // Use the actor's level to determine their base saving throw
    // this.baseSavingThrow = 16 - this.level;
    // // Use the actor's level to determine their max hp
    // this.maxHealth = 8 + this.attributes.con.mod + ((this.level - 1) * (this.attributes.con.mod + 4)) + (this.level * this.resources.hp)
    // Use the actor's level to determine their max effort

  }

  getRollData() {
    const data = {};

    // Copy the attribute scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.attributes) {
      for (let [k, v] of Object.entries(this.attributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}