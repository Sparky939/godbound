import { systemPath } from '../constants.mjs'

/**
 * A pair of Rolls that comprise a single attack roll
 * It includes a hit roll and a damage roll
 * @param {object} rollParams
 * @param {string} rollParams.attribute
 * @param {string} rollParams.damageDie
 * @param {number} [rollParams.hitBonus]
 * @param {number} [rollParams.damageBonus]
 * @param {object} data
 * @param {object} [options]
 */
class GBAttackRoll {
    constructor(rollParams, data, options) {
        this.attackRoll = new Roll(
            `d20 + @${rollParams.attribute}.mod${
                rollParams.hitBonus ? ` + ${rollParams.hitBonus}` : ''
            }`,
            data,
            options
        )
        this.damageRoll = new GBDamageRoll(
            `d${rollParams.damageDie} + @${rollParams.attribute}.mod${
                rollParams.damageBonus ? ` + ${rollParams.damageBonus}` : ''
            }`,
            data,
            options
        )
    }

    static CHAT_TEMPLATE = systemPath('templates/dice/roll.html')

    /**
     * Execute the Roll asynchronously, replacing dice and evaluating the total result
     * @param {object} [options={}]                      Options which inform how the Roll is evaluated
     * @param {boolean} [options.minimize=false]         Minimize the result, obtaining the smallest possible value.
     * @param {boolean} [options.maximize=false]         Maximize the result, obtaining the largest possible value.
     * @param {boolean} [options.allowStrings=false]     If true, string terms will not cause an error to be thrown during
     *                                                   evaluation.
     * @param {boolean} [options.allowInteractive=true]  If false, force the use of non-interactive rolls and do not
     *                                                   prompt the user to make manual rolls.
     * @returns {Promise<Roll>}                          The evaluated Roll instance
     *
     * @example Evaluate a Roll expression
     * ```js
     * let r = new Roll("2d6 + 4 + 1d4");
     * await r.evaluate();
     * console.log(r.result); // 5 + 4 + 2
     * console.log(r.total);  // 11
     * ```
     */
    async evaluate(evalParams) {
        this.attackRoll = await this.attackRoll.evaluate(evalParams)
        this.damageRoll = await this.damageRoll.evaluate(evalParams)
        this._evaluated = true
        return this
    }

    async toMessage(messageData = {}, { rollMode, create = true } = {}) {
        if (rollMode === 'roll') rollMode = undefined
        rollMode ||= game.settings.get('core', 'rollMode')

        // Perform the roll, if it has not yet been rolled
        if (!this._evaluated)
            await this.evaluate({
                allowInteractive: rollMode !== CONST.DICE_ROLL_MODES.BLIND,
            })

        // Prepare chat data
        messageData = foundry.utils.mergeObject(
            {
                user: game.user.id,
                content: String(this.total),
                sound: CONFIG.sounds.dice,
            },
            messageData
        )
        console.log(this.attackRoll, this.damageRoll)
        messageData.rolls = [this.attackRoll, this.damageRoll]

        // Either create the message or just return the chat data
        const cls = getDocumentClass('ChatMessage')
        const msg = new cls(messageData)

        // Either create or return the data
        if (create) return cls.create(msg.toObject(), { rollMode })
        else {
            msg.applyRollMode(rollMode)
            return msg.toObject()
        }
    }
}

class GBDamageRoll extends Roll {
    constructor(formula, data, options = { straightDamage: false }) {
        super(formula, data, options)
    }

    /**
     *
     * @param {number} damage
     * @returns {number}
     */
    _getTranslatedDamage(damage) {
        if (damage <= 1) {
            return 0
        }
        if (damage <= 5) {
            return 1
        }
        if (damage <= 9) {
            return 2
        }
        if (damage > 9) {
            return 4
        }
    }

    /**
     * Return the total result of the Roll expression if it has been evaluated.
     * @type {number}
     */
    get result() {
        if (this.options.straightDamage) {
            return Number(this._total)
        } else {
            return this._getTranslatedDamage(this._total) || 0
        }
    }

    /**
     * Recreate a Roll instance using a provided data object
     * @param {object} data   Unpacked data representing the Roll
     * @returns {Roll}         A reconstructed Roll instance
     */
    static fromData(data) {
        // Redirect to the proper Roll class definition
        console.log(data)
        if (data.class && data.class !== this.name) {
            const cls = CONFIG.Dice.rolls.find((cls) => cls.name === data.class)
            if (!cls)
                throw new Error(
                    `Unable to recreate ${data.class} instance from provided data`
                )
            return cls.fromData(data)
        }

        // Create the Roll instance
        const roll = new this(data.formula, data.data, data.options)

        // Expand terms
        roll.terms = data.terms.map((t) => {
            if (t.class) {
                if (t.class === 'DicePool') t.class = 'PoolTerm' // Backwards compatibility
                if (t.class === 'MathTerm') t.class = 'FunctionTerm'
                return RollTerm.fromData(t)
            }
            return t
        })

        // Repopulate evaluated state
        if (data.evaluated ?? true) {
            roll._total = data.total
            roll._dice = (data.dice || []).map((t) => DiceTerm.fromData(t))
            roll._evaluated = true
        }
        return roll
    }
}

export { GBAttackRoll, GBDamageRoll }
