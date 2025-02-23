import { tables } from '../../helpers/tables.mjs'
import fns from '../../helpers/numbers.mjs'
import GodboundActorBase from './base-actor.mjs'
import { GBAttackRoll, GBDamageRoll, GBSaveRoll } from '../../helpers/roll.mjs'

export default class GodboundCharacter extends GodboundActorBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()

        schema.health = new fields.SchemaField({
            value: new fields.NumberField({
                ...requiredInteger,
                initial: 8,
            }),
            max: new fields.NumberField({
                ...requiredInteger,
                initial: 8,
            }),
        })

        schema.details = new fields.SchemaField({
            level: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 1,
                }),
                xp: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            }),
            move: new fields.SchemaField({
                land: new fields.NumberField({
                    ...requiredInteger,
                    initial: 30,
                }),
                burrow: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                fly: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                swim: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
            }),
            frayDie: new fields.StringField({
                ...requiredInteger,
                initial: '8',
                choices: { 4: '4', 6: '6', 8: '8', 10: '10', 12: '12' },
            }),
            wealth: new fields.NumberField({
                ...requiredInteger,
                initial: 0,
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
        schema.useShield = new fields.BooleanField({
            initial: false,
        })
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
                income: new fields.NumberField({
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
        this.prepareAttributes()
        this.prepareSaves()
        this.prepareLevelValues()
        const wornItem = this.parent.items.find((i) => {
            return i.type === 'armour' && i.system.worn
        })
        if (wornItem && wornItem.type == 'armour') {
            this.ac =
                wornItem.system.baseArmour -
                this.attributes.dex.mod -
                (this.useShield ? 1 : 0)
        } else {
            this.ac = 9 - this.attributes.dex.mod - (this.useShield ? 1 : 0)
        }
    }

    applyActiveEffects() {
        // TODO: Apply active effects if the order matters
        return super.applyActiveEffects()
    }

    prepareAttributes() {
        for (const key in this.attributes) {
            // Calculate the modifier using d20 rules.
            if (
                this.attributes[key].value > 19 ||
                this.attributes[key].value < 3
            ) {
                this.attributes[key].mod = 0
                this.attributes[key].value = 10
            } else {
                this.attributes[key].mod = tables.attr.find(
                    (r) =>
                        this.attributes[key].value >= r.score.min &&
                        this.attributes[key].value <= r.score.max
                )?.modifier
            }
            // Handle attribute label localization.
            this.attributes[key].check = 21 - this.attributes[key].value
            this.attributes[key].label =
                game.i18n.localize(CONFIG.GODBOUND.attributes[key]) ?? key
            this.attributes[key].abbr =
                game.i18n.localize(CONFIG.GODBOUND.abilityAbbreviations[key]) ??
                key
        }
    }
    prepareSaves() {
        for (const key in this.saves) {
            this.saves[key].value =
                16 - (this.getSaveMod(key) + this.details.level.value)
            this.saves[key].label =
                game.i18n.localize(CONFIG.GODBOUND.saves[key]) ?? key
        }
    }
    prepareLevelValues() {
        const { dominionSpent, influenceUsed, bonusEffort, bonusInfluence } =
            this.parent.items
                .filter((i) => i.type == 'project' || i.type == 'word')
                .reduce(
                    (acc, i) => ({
                        dominionSpent:
                            acc.dominionSpent + (i.system?.cost?.dominion || 0),
                        influenceUsed:
                            acc.influenceUsed +
                            (i.system?.cost?.influence || 0),
                        bonusEffort:
                            acc.bonusEffort +
                            (i.system?.effortOfTheWord ? 1 : 0),
                        bonusInfluence:
                            acc.bonusInfluence +
                            (i.system?.influenceOfTheWord ? 1 : 0),
                    }),
                    {
                        dominionSpent: 0,
                        influenceUsed: 0,
                        bonusEffort: 0,
                        bonusInfluence: 0,
                    }
                )
        this.resources.dominion.spent = dominionSpent
        const { level, idx } = tables.advancement.reduce(
            (acc, r, idx) => {
                if (
                    r.requirements.xp <= this.details.level.xp &&
                    r.requirements.dominionSpent <=
                        this.resources.dominion.spent &&
                    r.level >= acc.level
                ) {
                    return { level: r.level, idx }
                } else {
                    return acc
                }
            },
            { level: 1, idx: 0 }
        ) ?? { level: 1, idx: 0 }
        this.details.level.value = level
        if (level < 10) {
            this.advancement = tables.advancement[idx + 1].requirements
        } else {
            this.advancement = false
        }
        this.resources.effort.max =
            this.details.level.value - 1 + 2 + bonusEffort
        this.resources.influence.max =
            this.details.level.value - 1 + 2 + bonusInfluence
        this.resources.effort.value = this.parent.items.reduce(
            (acc, i) =>
                ['word', 'gift'].includes(i.type)
                    ? Math.max(acc - i.system.effort, 0)
                    : acc,
            this.resources.effort.max
        )
        this.resources.influence.value =
            this.resources.influence.max - influenceUsed
        this.health.max =
            8 +
            this.attributes.con.mod +
            (this.details.level.value - 1) *
                (4 + Math.ceil(this.attributes.con.mod / 2))
        this.health.value = fns.bound(this.health.value, 0, this.health.max)
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

    wearArmour(id) {
        this.parent.items
            .filter((i) => i.type == 'armour')
            .forEach((i) => {
                if (i._id == id) {
                    i.update({ 'system.worn': !i.system.worn })
                } else {
                    i.update({ 'system.worn': false })
                }
            })
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
    toggleShield() {
        this.useShield = !this.useShield
    }

    attributeCheck(attributeId, options = {}) {
        const dialogParams = {
            difficulties: CONFIG.GODBOUND.difficulties,
            defaultDifficulty: 'Mortal',
            attribute: CONFIG.GODBOUND.attributes[attributeId]?.label ?? '',
            rollModes: CONFIG.Dice.rollModes,
            defaultRollMode: game.settings.get('core', 'rollMode'),
        }
        renderTemplate(
            'systems/godbound/templates/actor/modal/ability-check.hbs',
            dialogParams
        ).then((content) => {
            return new Promise((resolve) =>
                new Dialog({
                    title: `${game.i18n.format(
                        CONFIG.GODBOUND.AttributePromptTitle,
                        {
                            attribute: dialogParams.attribute,
                        }
                    )}: ${this.parent.name}`,
                    content,
                    buttons: {
                        roll: {
                            label: game.i18n.localize(CONFIG.GODBOUND.Roll),
                            callback: (html) =>
                                this._onAttributeDialogSubmit(
                                    html,
                                    attributeId
                                ),
                        },
                    },
                    default: 'roll',
                    close: () => resolve(null),
                }).render(true)
            )
        })
    }

    // TODO: We need to re-introduce flavour text from the Weapon/Gift used
    async attack(rawItem) {
        // To avoid having to enter AC every time we're calculating the AC
        // the resulting attack would have successfully hit
        const item = rawItem.system
        const attackParams = {
            attackBonus: `@lvl + @${item.attribute}.mod${
                item.hitBonus ? ' + @extraBonus.hit' : ''
            }`,
            damageBonus: `@${item.attribute}.mod${
                item.damageBonus ? ' + @extraBonus.dmg' : ''
            }`,
            damageDie: item.damageDie,
        }
        const attackRoll = await new GBAttackRoll(
            attackParams,
            {
                ...this.getRollData(),
                extraBonus: {
                    hit: item.hitBonus,
                    dmg: item.damageBonus,
                },
            },
            {
                flavor: `${this.parent.name} attacks with ${item.parent.name}`,
                straightDamage: item.straightDamage,
            }
        ).evaluate()
        attackRoll.toMessage()
        return attackRoll
    }

    async saveCheck(saveId, options = {}) {
        const dialogParams = {
            options: CONFIG.GODBOUND.rollTypes, // Normal, Advantage, Disadvantage
            defaultRollType: 'Normal',
            rollModes: CONFIG.Dice.rollModes,
            defaultRollMode: game.settings.get('core', 'rollMode'),
        }
        renderTemplate(
            'systems/godbound/templates/actor/modal/save-check.hbs',
            dialogParams
        ).then((content) => {
            return new Promise((resolve) => {
                new Dialog({
                    title: `${game.i18n.format(
                        CONFIG.GODBOUND.SavePromptTitle,
                        {
                            save: this.saves[saveId].label,
                        }
                    )}: ${this.parent.name}`,
                    content,
                    buttons: {
                        roll: {
                            label: game.i18n.localize(CONFIG.GODBOUND.Roll),
                            callback: (html) =>
                                this._onSaveDialogSubmit(html, saveId),
                        },
                    },
                    default: 'roll',
                    close: () => resolve(null),
                }).render(true)
            })
        })
    }

    async rollFrayDie() {
        const damageRoll = await new GBDamageRoll(
            `d${this.details.frayDie}`,
            this.getRollData(),
            { straightDamage: false }
        ).evaluate()
        damageRoll.toMessage()
        return damageRoll
    }

    async _onAttributeDialogSubmit(html, attributeId) {
        const formData = new FormDataExtended(html[0].querySelector('form'))
        const submitData = foundry.utils.expandObject(formData.object)
        // create Roll
        const roll = await new Roll(
            'd20' +
                (submitData.relevantFact ? '+4' : '') +
                (submitData.bonus ? `+ ${submitData.bonus}` : '')
        ).evaluate()
        const result = roll.total
        const difficulty =
            submitData.difficulty == 'Mortal'
                ? 0
                : submitData.difficulty == 'PushLimits'
                ? 4
                : 8
        const checkRequirement =
            21 - this.attributes[attributeId].value + difficulty
        const outcome =
            (roll.number == 20 || result >= checkRequirement) &&
            roll.number != 1
        // translate result into succes/failure
        const messageData = {
            speaker: {
                alias: this.name,
                actor: this.parent,
            },
            flavor: game.i18n.format(CONFIG.GODBOUND.AttributeCheckResult, {
                attribute: this.attributes[attributeId].label,
                checkTarget: checkRequirement,
            }),
            outcome: `${result} vs. ${checkRequirement}: ${
                outcome ? 'Pass' : 'Fail'
            }`,
            rollMode: submitData.rollMode,
        }
        roll.toMessage(messageData)

        return roll
    }
    async _onSaveDialogSubmit(html, saveId) {
        const formData = new FormDataExtended(html[0].querySelector('form'))
        const submitData = foundry.utils.expandObject(formData.object)
        const penalty = this.saves[saveId].penalty
        // create Roll
        const roll = await new GBSaveRoll(
            {
                modifier: (penalty ? -4 : 0) + submitData.otherModifiers,
            },
            {
                rollType: submitData.rollType,
                checkRequirement: this.saves[saveId].value,
            }
        ).evaluate()
        const messageData = {
            speaker: {
                alias: this.name,
                actor: this.parent,
            },
            flavor: game.i18n.format(CONFIG.GODBOUND.SaveCheckResult, {
                save: this.saves[saveId].label,
            }),
            rollMode: submitData.rollMode,
        }
        roll.toMessage(messageData)
        return roll
        // translate result into success/failure

        return roll
    }
}
