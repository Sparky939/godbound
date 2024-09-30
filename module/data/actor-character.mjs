import { tables } from '../helpers/tables.mjs'
import GodboundActorBase from './base-actor.mjs'

export default class GodboundCharacter extends GodboundActorBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()

        schema.details = new fields.SchemaField({
            level: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 1,
                }),
                xp: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            }),
        })

        // Iterate over attribute names and create a new SchemaField for each.
        schema.attributes = new fields.SchemaField(
            Object.keys(CONFIG.GODBOUND.attributes).reduce((obj, attribute) => {
                obj[attribute] = new fields.SchemaField({
                    value: new fields.NumberField({
                        ...requiredInteger,
                        initial: 10,
                        min: 0,
                    }),
                })
                return obj
            }, {})
        )
        schema.saves = new fields.SchemaField(
            Object.keys(CONFIG.GODBOUND.saves).reduce((obj, save) => {
                obj[save] = new fields.SchemaField({})
                return obj
            }, {})
        )
        schema.resources = new fields.SchemaField({
            effort: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 2,
                    min: 0,
                }),
                max: new fields.NumberField({
                    ...requiredInteger,
                    initial: 2,
                    min: 0,
                }),
            }),
            influence: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 2,
                    min: 0,
                }),
                max: new fields.NumberField({
                    ...requiredInteger,
                    initial: 2,
                    min: 0,
                }),
            }),
            dominion: new fields.SchemaField({
                gained: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                    min: 0,
                }),
                perMonth: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                    min: 0,
                }),
                spent: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                    min: 0,
                }),
            }),
        })
        return schema
    }

    prepareDerivedData() {
        // Loop through attribute scores, and add their modifiers to our sheet output.
        for (const key in this.attributes) {
            // Calculate the modifier using d20 rules.
            this.attributes[key].mod = tables.attr.find(
                (r) =>
                    this.attributes[key].value >= r.score.min &&
                    this.attributes[key].value <= r.score.max
            )?.modifier
            // Handle attribute label localization.
            this.attributes[key].check = 21 - this.attributes[key].value
            this.attributes[key].label =
                game.i18n.localize(CONFIG.GODBOUND.attributes[key]) ?? key
            this.attributes[key].abbr =
                game.i18n.localize(CONFIG.GODBOUND.abilityAbbreviations[key]) ??
                key
        }
        // Loop through save scores, and add their modifiers to our sheet output.
        for (const key in this.saves) {
            this.saves[key].value =
                16 - (this.getSaveMod(key) + this.details.level.value)
            this.saves[key].label =
                game.i18n.localize(CONFIG.GODBOUND.saves[key]) ?? key
        }
        // TODO: Find if there are any Gifts that modify these values.
        this.resources.effort.max = this.details.level.value + 2
        this.resources.influence.max = this.details.level.value + 2
    }

    getSaveMod(save) {
        switch (save) {
            case 'hardiness':
                return Math.max(
                    this.attributes.con.mod,
                    this.attributes.str.mod
                )
            case 'evasion':
                return Math.max(
                    this.attributes.dex.mod,
                    this.attributes.int.mod
                )
            case 'spirit':
                return Math.max(
                    this.attributes.wis.mod,
                    this.attributes.cha.mod
                )
        }
    }

    getRollData() {
        const data = {}

        // Copy the attribute scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
        if (this.attributes) {
            for (let [k, v] of Object.entries(this.attributes)) {
                data[k] = foundry.utils.deepClone(v)
            }
        }

        data.lvl = this.details.level.value

        return data
    }

    attributeCheck(attributeId, options = {}) {
        const dialogParams = {
            difficulties: CONFIG.GODBOUND.difficulties,
            defaultDifficulty: 'Mortal',
            attribute: CONFIG.GODBOUND.attributes[attributeId]?.label ?? '',
            rollModes: CONFIG.Dice.rollModes,
            defaultRollMode: game.settings.get('core', 'rollMode'),
        }
        console.log('dialogParams', dialogParams)
        console.log('this', this)
        renderTemplate(
            'systems/godbound/templates/actor/modal/ability-check.hbs',
            dialogParams
        ).then((content) => {
            return new Promise((resolve) =>
                new Dialog({
                    title: `${game.i18n.format(CONFIG.GODBOUND.AttributePromptTitle, { attribute: dialogParams.attribute })}: ${this.parent.name}`,
                    content,
                    buttons: {
                        roll: {
                            label: game.i18n.localize(CONFIG.GODBOUND.Roll),
                            callback: (html) =>
                                this._onDialogSubmit(html, attributeId),
                        },
                    },
                    default: 'roll',
                    close: () => resolve(null),
                }).render(true)
            )
        })
    }

    async _onDialogSubmit(html, attributeId) {
        const formData = new FormDataExtended(html[0].querySelector('form'))
        const submitData = foundry.utils.expandObject(formData.object)
        console.log(formData, submitData)
        // create Roll
        const roll = await new Roll('d20' + (submitData.relevantFact ? "+4" : "")).evaluate()
        const result = roll.total;
        console.log("result", result)
        const difficulty = submitData.difficulty == 'Mortal' ? 0 : submitData.difficulty == 'PushLimits' ? 4 : 8
        const checkRequirement = 21 - this.attributes[attributeId].value + difficulty;
        const outcome =
            (result == 20 ||
                result >= checkRequirement) && result != 1
        // translate result into succes/failure
        const messageData = {
            speaker: {
                alias: this.name,
                actor: this.parent,
            },
            flavor: game.i18n.format(CONFIG.GODBOUND.AttributeCheckResult, {
                attribute: this.attributes[attributeId].label,
                result: outcome ? 'Success' : 'Failure',
            }),
            rollMode: submitData.rollMode,
        }
        console.log(messageData)
        roll.toMessage(messageData)
        console.log(roll)

        return roll
    }
}
