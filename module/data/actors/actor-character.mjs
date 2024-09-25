import GodboundActorBase from './base-actor.mjs'
import { GODBOUND } from '../../helpers/config.mjs'
import {
    ATTRIBUTE_MODIFIERS,
    LEVEL_REQUIREMENTS,
} from '../../helpers/tables.mjs'

/**
 * @param {boolean} configMode 
 * @param {object} details
 * @param {object} details.health
 * @param {number} details.health.value
 * @param {number} details.health.max (derived)
 * @param {object} details.health.bonuses
 * @param {number} details.health.bonuses.level
 * @param {number} details.health.bonuses.flat
 * @param {number} details.xp
 * @param {number} details.level (derived)
 * @param {object} details.move
 * @param {number} details.move.land
 * @param {number} details.move.burrow
 * @param {number} details.move.swim
 * @param {number} details.move.fly
 * @param {string} details.goal
 * @param {array} details.facts
 * @param {number} details.wealth
 * @param {object} attributes
 * @param {object} attributes.str/dex/con/wis/int/cha
 * @param {number} attributes.<attribute score abbr>.value
 * @param {number} attributes.<attribute score abbr>.mod
 * @param {number} attributes.<attribute score abbr>.label
 * @param {object} defence
 * @param {object} defence.armor
 * @param {string} defence.armor.type
 * @param {number} defence.armor.value (derived)
 * @param {array} defence.armor.penalties
 * @param {boolean} defence.armor.shield
 * @param {number} defence.baseSaveBonus (derived)
 * @param {number} defence.hardinessMod (derived)
 * @param {number} defence.evasionMod (derived)
 * @param {number} defence.spiritMod (derived)
 * @param {object} offence
 * @param {string} offence.frayDie
 * @param {string} offence.baseAttackBonus (derived)
 * @param {object} resources
 * @param {object} resources.dominion
 * @param {number} resources.dominion.gained
 * @param {number} resources.dominion.spent
 * @param {number} resources.dominion.income
 * @param {object} resources.effort
 * @param {number} resources.effort.max (derived)
 * @param {number} resources.effort.available (derived)
 * @param {object} resources.influence
 * @param {number} resources.influence.max (derived)
 * @param {number} resources.influence.available (derived)
 * @param {array} words (settings)
 * @param {object} gifts
 * @param {array} gifts.<word>
 * @param {object} spells
 * @param {array} spells.<spellLevel>
 * @param {array} giftEffects
 */

export default class GodboundCharacter extends GodboundActorBase {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = {
            required: true,
            nullable: false,
            integer: true,
        }
        const schema = super.defineSchema()

        schema.configMode = new fields.BooleanField({
            initial: false
        })

        schema.details = new fields.SchemaField({
            health: new fields.SchemaField({
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                max: new fields.NumberField({
                    ...requiredInteger,
                    initial: 10
                }),
                bonuses: new fields.SchemaField({
                    level: new fields.NumberField({
                        ...requiredInteger,
                        initial: 0,
                    }),
                    flat: new fields.NumberField({
                        ...requiredInteger,
                        initial: 0,
                    }),
                }),
            }),
            xp: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            level: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            move: new fields.SchemaField({
                land: new fields.NumberField({
                    ...requiredInteger,
                    initial: 30,
                }),
                burrow: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                swim: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                fly: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            }),
            goal: new fields.StringField({ initial: '' }),
            facts: new fields.ArrayField(
                new fields.StringField({ initial: '' }),
                { initial: [] }
            ),
            wealth: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        })

        schema.defence = new fields.SchemaField({
            armor: new fields.SchemaField({
                type: new fields.StringField({
                    initial: 'none',
                    choices: Object.keys(GODBOUND.armorTypes),
                }),
                value: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                penalties: new fields.ArrayField(
                    new fields.StringField({
                        options: Object.keys(GODBOUND.armorTypes).map((k) => ({
                            value: k,
                            label: GODBOUND.armorTypes[k],
                        })),
                    }),
                    { initial: [] }
                ),
                shield: new fields.BooleanField({ initial: false }),
            }),
        })

        schema.offence = new fields.SchemaField({
            frayDie: new fields.StringField({
                initial: '1d8',
                required: true,
                blank: false,
                choices: ['1d8', '1d10', '1d12'],
            }),
            baseAttackBonus: new fields.NumberField({
                ...requiredInteger,
                initial: 1,
            }),
        })

        // Iterate over ability names and create a new SchemaField for each.
        schema.attributes = new fields.SchemaField(
            Object.keys(GODBOUND.attributes).reduce((obj, attribute) => {
                obj[attribute] = new fields.SchemaField({
                    value: new fields.NumberField({
                        ...requiredInteger,
                        initial: 10,
                        min: 3,
                        max: 19,
                    }),
                })
                return obj
            }, {})
        )

        schema.resources = new fields.SchemaField({
            dominion: new fields.SchemaField({
                gained: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                spent: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
                income: new fields.NumberField({
                    ...requiredInteger,
                    initial: 0,
                }),
            }),
            effort: new fields.SchemaField({
                max: new fields.NumberField({
                    ...requiredInteger,
                    initial: 2,
                }),
                available: new fields.NumberField({
                    ...requiredInteger,
                    initial: 2,
                }),
                bonuses: new fields.SchemaField({
                    level: new fields.NumberField({
                        ...requiredInteger,
                        initial: 0,
                    }),
                    flat: new fields.NumberField({
                        ...requiredInteger,
                        initial: 0,
                    }),
                }),
            }),
            influence: new fields.SchemaField({
                max: new fields.NumberField({
                    ...requiredInteger,
                    initial: 2,
                }),
                available: new fields.NumberField({
                    ...requiredInteger,
                    initial: 2,
                }),
                bonuses: new fields.SchemaField({
                    level: new fields.NumberField({
                        ...requiredInteger,
                        initial: 0,
                    }),
                    flat: new fields.NumberField({
                        ...requiredInteger,
                        initial: 0,
                    }),
                }),
            }),
        })

        return schema
    }

    prepareDerivedData() {
        this.words = game.settings
            .get('godbound', 'words')
            .split(',')
            .map((str) => String(str).trim())
        this.spells = Object.keys(GODBOUND.spells.level).map((lvl) => ({
            spellLevel: GODBOUND.spells.level[lvl],
            spells: this.parent.items.filter(
                (i) => i.type == 'spell' && i.level == lvl
            ),
        }))
        this.prepareModifiers()
        this.prepareLevel()
        this.prepareGifts()
        this.prepareSpells()
    }

    prepareModifiers() {
        for (const key in this.attributes) {
            // Calculate the modifier using d20 rules.
            this.attributes[key].mod = ATTRIBUTE_MODIFIERS.find(
                (attr) =>
                    this.attributes[key].value >= attr.min &&
                    this.attributes[key].value <= attr.max
            ).mod
            // Handle attribute label localization.
            this.attributes[key].label =
                game.i18n.localize(GODBOUND.attributes[key]) ?? key
        }
        this.prepareSaves()
    }

    prepareSaves() {
        this.defence.hardinessMod = Math.max(
            this.attributes.con.mod,
            this.attributes.str.mod
        )
        this.defence.evasionMod = Math.max(
            this.attributes.dex.mod,
            this.attributes.int.mod
        )
        this.defence.spiritMod = Math.max(
            this.attributes.wis.mod,
            this.attributes.cha.mod
        )
    }

    prepareLevel() {
        // TODO: get dominion spent from actor's project items
        const projects = this.parent.items.filter((i) => i.type === 'project')
        this.resources.dominion.spent = projects.reduce(
            (acc, p) => acc + p.system.cost.dominion,
            0
        )
        this.details.level =
            LEVEL_REQUIREMENTS.findIndex(
                (lvl) =>
                    this.details.xp >= lvl.xp &&
                    this.resources.dominion.spent >= lvl.dp
            ) + 1
        this.offence.baseAttackBonus = this.details.level
        this.defence.baseSaveBonus = 16 - this.details.level
        const currentHealthMax = this.details.health.max
        const newHealthMax =
            8 +
            this.attributes.con.mod +
            (this.details.level - 1) *
                (4 +
                    this.details.health.bonuses.level +
                    Math.ceil(this.attributes.con.mod / 2)) +
            this.details.health.bonuses.flat
        console.log(newHealthMax, this.details.health)
        this.details.health.max = newHealthMax
        console.log(this.details.health)
        this.details.health.value = Math.min(
            newHealthMax,
            this.details.health.value + (newHealthMax - currentHealthMax)
        )
        console.log(this.details.health)
        this.prepareResources()
    }

    prepareResources() {
        this.resources.effort.max =
            this.details.level * (2 + this.resources.effort.bonuses.level) +
            this.resources.effort.bonuses.flat

        // TODO: Update available effort based on spent effort.
        this.resources.effort.available = this.resources.effort.max
        this.resources.influence.max =
            this.details.level * (2 + this.resources.influence.bonuses.level) +
            this.resources.influence.bonuses.flat
        // TODO: Update available influence based on spent influence.
        this.resources.influence.available = this.resources.influence.max
    }

    prepareGifts() {
        this.gifts = {}
        for (const word of this.words) {
            this.gifts[word] = this.parent.items.filter(
                (i) => i.type === 'gift' && i.word === word
            )
        }
    }

    prepareSpells() {
        this.spells = {}
        Object.keys(GODBOUND.spells.level).map((lvl) => {
            this.spells[lvl] = this.parent.items
                .filter((i) => i.type === 'spell' && i.level === lvl)
                .sort((a, b) => a.name.localeCompare(b.name))
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

        data.lvl = this.details.level

        return data
    }
}
