import GodboundActorBase from "./base-actor.mjs";
import CONFIG from "../helpers/config.mjs";
import {ATTRIBUTE_MODIFIERS} from "../helpers/tables.mjs";

/**
 * @param {object} details
 * @param {object} details.health
 * @param {number} details.health.value
 * @param {number} details.health.max (derived)
 * @param {object} details.health.bonuses
 * @param {number} details.health.bonuses.level
 * @param {number} details.health.bonuses.flat
 * @param {number} details.xp
 * @param {object} details.armor.type
 * @param {number} details.armor.value (derived)
 * @param {array} details.armor.penalties
 * @param {boolean} details.armor.shield
 * @param {object} details.move
 * @param {number} details.move.land
 * @param {number} details.move.burrow
 * @param {number} details.move.swim
 * @param {number} details.move.fly
 * @param {string} details.goal
 * @param {array} details.facts
 * @param {number} details.wealth
 * @param {object} attributes
 * @param {number} attributes.level (derived)
 * @param {object} attributes.str/dex/con/wis/int/cha
 * @param {number} attributes.<attribute score abbr>.value
 * @param {number} attributes.<attribute score abbr>.mod
 * @param {number} attributes.<attribute score abbr>.label
 * @param {string} attributes.frayDie
 * @param {string} attributes.baseAttackBonus (derived)
 * @param {string} attributes.baseSaveBonus (derived)
 * @param {string} attributes.hardinessMod (derived)
 * @param {string} attributes.evasionMod (derived)
 * @param {string} attributes.spiritMod (derived)
*/

export default class GodboundCharacter extends GodboundActorBase {


  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.details = new fields.SchemaField({
      health: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bonuses: new fields.SchemaField({
          level: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          flat: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        }),
      }),
      xp: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      armor: new fields.SchemaField({
        type: new fields.StringField({ initial: "unarmored" }),
        penalties: new fields.ArrayField(fields.StringField({ options: Object.keys(CONFIG.GODBOUND.armorTypes).map(k => ({value: k, label: CONFIG.GODBOUND.armorTypes[k]})) }), {initial: []}),
        shield: new fields.BooleanField({ initial: false }),
      }),
      move: new fields.SchemaField({
        land: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        burrow: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        swim: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        fly: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      goal: new fields.StringField({ initial: "" }),
      facts: new fields.ArrayField({ type: fields.StringField(), initial: [] }),
      wealth: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    })

    schema.attributes = new fields.SchemaField({
      frayDie: new fields.StringField({
        initial: "1d8",
        required: true,
        blank: false,
        choices: ["1d8", "1d10", "1d12"],
      })
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
