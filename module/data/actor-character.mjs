import { tables } from "../helpers/tables.mjs";
import GodboundActorBase from "./base-actor.mjs";

export default class GodboundCharacter extends GodboundActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.details = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        xp: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
    });

    // Iterate over attribute names and create a new SchemaField for each.
    schema.attributes = new fields.SchemaField(
      Object.keys(CONFIG.GODBOUND.attributes).reduce((obj, attribute) => {
        obj[attribute] = new fields.SchemaField({
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
        value: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 })
      }),
      influence: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 })
      }),
      dominion: new fields.SchemaField({
        gained: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        perMonth: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        spent: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
      })
    })
    return schema;
  }

  prepareDerivedData() {
    // Loop through attribute scores, and add their modifiers to our sheet output.
    for (const key in this.attributes) {
      // Calculate the modifier using d20 rules.
      this.attributes[key].mod = tables.attr.find(
        (r) => this.attributes[key].value >= r.score.min
          && this.attributes[key].value <= r.score.max
      )?.modifier;
      // Handle attribute label localization.
      this.attributes[key].check = 21 - this.attributes[key].value;
      this.attributes[key].label = game.i18n.localize(CONFIG.GODBOUND.attributes[key]) ?? key;
      this.attributes[key].abbr = game.i18n.localize(CONFIG.GODBOUND.abilityAbbreviations[key]) ?? key;
    }
    // Loop through save scores, and add their modifiers to our sheet output.
    for (const key in this.saves) {
      this.saves[key].value = 16 - (this.getSaveMod(key) + this.details.level.value);
      this.saves[key].label = game.i18n.localize(CONFIG.GODBOUND.saves[key]) ?? key;
    }
    // TODO: Find if there are any Gifts that modify these values.
    this.resources.effort.max = this.details.level.value + 2;
    this.resources.influence.max = this.details.level.value + 2;
  }

  getSaveMod(save) {
    switch(save) {
      case 'hardiness':
        return Math.max(this.attributes.con.mod, this.attributes.str.mod);
      case 'evasion':
        return Math.max(this.attributes.dex.mod, this.attributes.int.mod);
      case 'spirit':
        return Math.max(this.attributes.wis.mod, this.attributes.cha.mod);
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

    data.lvl = this.details.level.value;

    return data
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.attribute-mod').click(this._onAbilityCheck.bind(this));
  }

  async _onAbilityCheck(event) {
    event.preventDefault();
    const attributeId = event.currentTarget.dataset.attribute;
    const label = CONFIG.GODBOUND.attributes[attributeId]?.label ?? "";
    const content = await renderTemplate(
      "systems/godbound/templates/dialogs/ability-check.html",
      {
       attribute: label, 
      defaultRollMode,
      relevantFact,
      rollModes: CONFIG.Dice.rollModes
    });
    new Dialog({
      title: `${game.i18n.format("CONFIG.GODBOUND.AttributePromptTitle", {attribute: label})}: ${this.name}`,
      content,
      buttons: {
        roll: {
          label: game.i18n.localize("CONFIG.Dice.Roll"),
          callback: (html) => this._onDialogSubmit(html)
        }
      },
      default: "roll",
      close: () => resolve(null)
    }).render(true);
  }

  _onDialogSubmit(html) {
    const formData = new FormDataExtended(html[0].querySelector("form"));
    const submitData = foundry.utils.expandObject(formData.object);

    // Append a situational bonus term
    if ( submitData.bonus ) {
      const bonus = new Roll(submitData.bonus, this.data);
      if ( !(bonus.terms[0] instanceof OperatorTerm) ) this.terms.push(new OperatorTerm({operator: "+"}));
      this.terms = this.terms.concat(bonus.terms);
    }

    // Set the ammunition
    if ( submitData.ammunition ) this.options.ammunition = submitData.ammunition;

    // Set the attack mode
    if ( submitData.attackMode ) this.options.attackMode = submitData.attackMode;

    // Customize the modifier
    if ( submitData.ability ) {
      const abl = this.data.abilities[submitData.ability];
      this.terms = this.terms.flatMap(t => {
        if ( t.term === "@mod" ) return new NumericTerm({number: abl.mod});
        if ( t.term === "@abilityCheckBonus" ) {
          const bonus = abl.bonuses?.check;
          if ( bonus ) return new Roll(bonus, this.data).terms;
          return new NumericTerm({number: 0});
        }
        return t;
      });
      this.options.flavor += ` (${CONFIG.DND5E.abilities[submitData.ability]?.label ?? ""})`;
    }

    // Set the mastery
    if ( submitData.mastery ) this.options.mastery = submitData.mastery;

    // Apply advantage or disadvantage
    this.options.advantageMode = advantageMode;
    this.options.rollMode = submitData.rollMode;
    this.configureModifiers();
    return this;
  }
}