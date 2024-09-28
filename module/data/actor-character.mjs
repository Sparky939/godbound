import { tables } from "../helpers/tables.mjs";
import GodboundActorBase from "./base-actor.mjs";

export default class GodboundCharacter extends GodboundActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        xp: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(CONFIG.GODBOUND.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
        });
        return obj;
      }, {})
    );
    schema.saves = new fields.SchemaField(
      Object.keys(CONFIG.GODBOUND.saves).reduce((obj, save) => {
        obj[save] = new fields.SchemaField({
        });
        return obj;
      }, {})
    );
    schema.resources = new fields.SchemaField({
      effort: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 })
      })
    })
    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = tables.find(
        (r) => this.abilities[key].value >= r.score.min
          && this.abilities[key].value <= r.score.max
      )?.modifier;
      // Handle ability label localization.
      this.attributes[key].check = 21 - this.abilities[key].value;
      this.abilities[key].label = game.i18n.localize(CONFIG.GODBOUND.abilities[key]) ?? key;
      this.abilities[key].abbr = game.i18n.localize(CONFIG.GODBOUND.abilityAbbreviations[key]) ?? key;
    }
    for (const key in this.saves) {
      this.saves[key].value = 16 - (this.getSaveMod(key) + this.attributes.level.value);
      this.saves[key].label = game.i18n.localize(CONFIG.GODBOUND.saves[key]) ?? key;
    }
  }

  getSaveMod(save) {
    switch(save) {
      case 'hardiness':
        return Math.max(this.abilities.con.mod, this.abilities.str.mod);
      case 'evasion':
        return Math.max(this.abilities.dex.mod, this.abilities.int.mod);
      case 'spirit':
        return Math.max(this.abilities.wis.mod, this.abilities.cha.mod);
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}