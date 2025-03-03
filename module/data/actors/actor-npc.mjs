import {
    GBMoraleRoll,
    GBSaveRoll,
    GBAttackRoll,
    rollSaveCheck,
} from '../../helpers/roll.mjs'
import GodboundActorBase from './base-actor.mjs'

/**
 * @param {object} resources
 * @param {object} resources.hd
 * @param {number} resources.hd.value
 * @param {number} resources.hd.max
 * @param {object} resources.effort
 * @param {number} resources.effort.value
 * @param {number} resources.effort.max
 * @param {number} defence.save
 * @param {number} defence.ac
 * @param {object} details
 * @param {string} details.move
 * @param {string} details.description
 * @param {string} details.goal
 */

export default class GodboundNPC extends GodboundActorBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()
        schema.settings = new fields.SchemaField({
            mode: new fields.StringField({
                required: true,
                initial: 'edit',
                options: Object.keys(CONFIG.GODBOUND.SheetModes),
            }),
        })

        schema.resources = new fields.SchemaField({
            hd: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                baseMax: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
            }),
            effort: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                max: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                canSave: new fields.BooleanField({ initial: true }),
            }),
        })

        schema.defence = new fields.SchemaField({
            save: new fields.NumberField({
                ...requiredInteger,
                initial: 12,
            }),
            morale: new fields.NumberField({ ...requiredInteger, initial: 7 }),
            ac: new fields.NumberField({ ...requiredInteger, initial: 9 }),
            supernatural: new fields.BooleanField({ initial: false }),
        })
        schema.offense = new fields.SchemaField({
            actions: new fields.NumberField({
                ...requiredInteger,
                initial: 1,
            }),
            attack: new fields.NumberField({
                ...requiredInteger,
                initial: 0,
            }),
            magicalAttacks: new fields.BooleanField({ initial: false }),
            damageDie: new fields.StringField({ initial: '6' }),
            damageBonus: new fields.NumberField({ initial: 0 }),
            damageType: new fields.StringField({ initial: '' }),
            straightDamage: new fields.BooleanField({ initial: false }),
        })

        schema.details = new fields.SchemaField({
            move: new fields.StringField({ initial: '30 ft.' }),
            mob: new fields.BooleanField({ initial: false }),
            mobType: new fields.StringField({
                initial: 'small',
                choices: CONFIG.GODBOUND.MobTypes,
            }),
        })

        return schema
    }

    prepareDerivedData() {
        super.prepareDerivedData()
    }

    getRollData() {
        const data = {}
        data.attackBonus = this.offense.attack
        data.damageDie = this.offense.damageDie
        data.damageBonus = this.offense.damageBonus
        data.save = this.defence.save
        data.ac = this.defence.ac

        return data
    }

    async attack() {
        const attackParams = {
            attackBonus: `@attackBonus`,
            damageBonus: `@damageBonus`,
            damageDie: `@damageDie`,
        }
        const attackRoll = await new GBAttackRoll(
            attackParams,
            this.getRollData(),
            {
                flavor: `${this.parent.name} attacks`,
                straightDamage: this.offense.straightDamage,
                damageType: this.offense.damageType,
            }
        ).evaluate()
        attackRoll.toMessage()
        return attackRoll
    }

    moraleCheck(options = { shiftClick: false }) {
        if (options.shiftClick) {
            this._onMoraleDialogSubmit({
                otherModifiers: '',
                rollMode: game.settings.get('core', 'rollMode'),
            })
        } else {
            const dialogParams = {
                rollModes: CONFIG.Dice.rollModes,
                defaultRollMode: game.settings.get('core', 'rollMode'),
            }
            renderTemplate(
                'systems/godbound/templates/actor/modal/bonus-dialog.hbs',
                dialogParams
            ).then((content) => {
                return new Promise((resolve) => {
                    new Dialog({
                        title: `${game.i18n.localize(
                            CONFIG.GODBOUND.MoralePromptTitle
                        )}: ${this.parent.name}`,
                        content,
                        buttons: {
                            roll: {
                                label: game.i18n.localize(CONFIG.GODBOUND.Roll),
                                callback: (html) =>
                                    this._onMoraleDialogSubmit(
                                        foundry.utils.expandObject(
                                            new FormDataExtended(
                                                html[0].querySelector('form')
                                            ).object
                                        )
                                    ),
                            },
                        },
                        default: 'roll',
                        close: () => resolve(null),
                    }).render(true)
                })
            })
        }
    }
    async _onMoraleDialogSubmit(submitData) {
        // create Roll
        const roll = await new GBMoraleRoll(
            '',
            {},
            { morale: this.defence.morale + submitData.otherModifiers }
        ).evaluate()
        const messageData = {
            speaker: {
                alias: this.name,
                actor: this.parent,
            },
            rollMode: submitData.rollMode,
        }
        roll.toMessage(messageData)
        return roll
    }

    async saveCheck(options = { shiftClick: false }) {
        if (options.shiftClick) {
            this._onSaveDialogSubmit({
                otherModifiers: '',
                rollType: 'Normal',
                rollMode: game.settings.get('core', 'rollMode'),
            })
        } else {
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
                                save: 'NPC',
                            }
                        )}: ${this.parent.name}`,
                        content,
                        buttons: {
                            roll: {
                                label: game.i18n.localize(CONFIG.GODBOUND.Roll),
                                callback: (html) =>
                                    this._onSaveDialogSubmit(
                                        foundry.utils.expandObject(
                                            new FormDataExtended(
                                                html[0].querySelector('form')
                                            ).object
                                        )
                                    ),
                            },
                        },
                        default: 'roll',
                        close: () => resolve(null),
                    }).render(true)
                })
            })
        }
    }
    async _onSaveDialogSubmit(submitData) {
        // create Roll
        const roll = await rollSaveCheck({
            ...submitData,
            checkRequirement: this.defence.save,
            saveLabel: 'NPC',
        })
        const messageData = {
            speaker: {
                alias: this.name,
                actor: this.parent,
            },
            rollMode: submitData.rollMode,
        }
        roll.toMessage(messageData)
        return roll
    }
}
