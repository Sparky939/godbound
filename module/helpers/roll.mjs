import { systemPath } from '../constants.mjs'
import { GODBOUND } from './config.mjs'
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
        const { flavor, ...rest } = options
        if (rollParams.damageDie) {
            // TODO: Need to remove the reference to attribute to allow for split modifiers
            this.attackRoll = new GBHitRoll(
                `d20 + ${rollParams.attackBonus || 0}`,
                data,
                options
            )
            this.damageRoll = new GBDamageRoll(
                `d${rollParams.damageDie} + ${rollParams.damageBonus || 0}`,
                data,
                {
                    ...rest,
                    flavor: `Damage${
                        options.damageType ? ` [${options.damageType}]` : ''
                    }`,
                }
            )
        } else {
            throw 'No damage die provided for attack'
        }
    }

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

class GBHitRoll extends Roll {
    constructor(formula, data, options) {
        super(formula, data, options)
    }

    static CHAT_TEMPLATE = systemPath('templates/dice/hitRoll.html')
    static TOOLTIP_TEMPLATE = systemPath('templates/dice/tooltip.html')

    /**
     * Render a Roll instance to HTML
     * @param {object} [options={}]               Options which affect how the Roll is rendered
     * @param {string} [options.flavor]             Flavor text to include
     * @param {string} [options.template]           A custom HTML template path
     * @param {boolean} [options.isPrivate=false]   Is the Roll displayed privately?
     * @returns {Promise<string>}                 The rendered HTML template as a string
     */
    async render({
        flavor,
        template = this.constructor.CHAT_TEMPLATE,
        isPrivate = false,
    } = {}) {
        if (!this._evaluated)
            await this.evaluate({ allowInteractive: !isPrivate })
        const lowestACHit = 20 - this.total
        const armorClass =
            this.number == 20
                ? 'Hit'
                : lowestACHit > 9
                ? 'Miss'
                : `AC ${lowestACHit}`
        const chatData = {
            formula: isPrivate ? '???' : this._formula,
            flavor: isPrivate ? null : flavor ?? this.options.flavor,
            user: game.user.id,
            tooltip: isPrivate ? '' : await this.getTooltip(),
            total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
            armorClass: isPrivate ? '?' : armorClass,
        }
        return renderTemplate(template, chatData)
    }
}

class GBDamageRoll extends Roll {
    constructor(formula, data, options = { straightDamage: false }) {
        super(formula, data, options)
    }

    static CHAT_TEMPLATE = systemPath('templates/dice/damageRoll.html')
    static TOOLTIP_TEMPLATE = systemPath('templates/dice/tooltip.html')
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

    get damage() {
        return this._getTranslatedDamage(this.total)
    }

    /**
     * Render a Roll instance to HTML
     * @param {object} [options={}]               Options which affect how the Roll is rendered
     * @param {string} [options.flavor]             Flavor text to include
     * @param {string} [options.template]           A custom HTML template path
     * @param {boolean} [options.isPrivate=false]   Is the Roll displayed privately?
     * @returns {Promise<string>}                 The rendered HTML template as a string
     */
    async render({
        flavor,
        template = this.constructor.CHAT_TEMPLATE,
        isPrivate = false,
    } = {}) {
        if (!this._evaluated)
            await this.evaluate({ allowInteractive: !isPrivate })
        const chatData = {
            formula: isPrivate ? '???' : this._formula,
            flavor: isPrivate ? null : flavor ?? this.options.flavor,
            user: game.user.id,
            tooltip: isPrivate ? '' : await this.getTooltip(),
            total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
            convertedDamage: !this.options.straightDamage,
            damage: isPrivate ? '?' : this._getTranslatedDamage(this.total),
        }
        return renderTemplate(template, chatData)
    }
}

export async function rollSaveCheck(
    opts = { penalty: false, otherModifiers: 0, rollType: 'Normal' }
) {
    if (!opts.checkRequirement) {
        throw new Error('Check requirement is required')
    }
    if (!opts.saveLabel) {
        throw new Error('Save label is required')
    }
    var formula = 'd20'
    if (opts.rollType == 'Advantage') {
        formula += 'kh'
    }
    if (opts.rollType == 'Disadvantage') {
        formula += 'kl'
    }
    if (opts.penalty) {
        formula += ' - 4'
    }
    if (
        typeof opts.otherModifiers == 'number' &&
        opts.otherModifiers != 0 &&
        !isNaN(opts.otherModifiers)
    ) {
        formula += `${
            opts.otherModifiers > 0
                ? ` + ${opts.otherModifiers}`
                : opts.otherModifiers
        }`
    }
    if (opts.rollType == 'Normal') {
        formula = `1${formula}`
    } else {
        formula = `2${formula}`
    }
    return await new GBSaveRoll(formula, {}, opts).evaluate()
}

class GBSaveRoll extends Roll {
    constructor(
        formula,
        data,
        options = { rollType: 'Normal', checkRequirement: 15 }
    ) {
        super(formula, data, options)
    }

    static CHAT_TEMPLATE = systemPath('templates/dice/saveRoll.html')
    static TOOLTIP_TEMPLATE = systemPath('templates/dice/tooltip.html')

    async render({
        template = this.constructor.CHAT_TEMPLATE,
        isPrivate = false,
    } = {}) {
        if (!this._evaluated)
            await this.evaluate({ allowInteractive: !isPrivate })
        const chatData = {
            formula: isPrivate ? '???' : this._formula,
            flavor: isPrivate
                ? null
                : game.i18n.format(CONFIG.GODBOUND.SaveCheckResult, {
                      save: this.options.saveLabel,
                      checkTarget: this.options.checkRequirement,
                  }),
            user: game.user.id,
            tooltip: isPrivate ? '' : await this.getTooltip(),
            total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
            success: isPrivate
                ? '?'
                : this.total >= this.options.checkRequirement,
        }
        return renderTemplate(template, chatData)
    }
}

export async function rollAttributeCheck(
    opts = { relevantFact: false, otherModifiers: 0, difficulty: 'Mortal' }
) {
    if (!opts.attributeValue) {
        throw new Error('Attribute value is required')
    }
    if (!opts.attributeLabel) {
        throw new Error('Attribute label is required')
    }
    var formula = '1d20'
    if (opts.relevantFact) {
        formula += ' + 4'
    }
    if (
        typeof opts.otherModifiers == 'number' &&
        opts.otherModifiers != 0 &&
        !isNaN(opts.otherModifiers)
    ) {
        formula += `${
            opts.otherModifiers > 0
                ? ` + ${opts.otherModifiers}`
                : opts.otherModifiers
        }`
    }
    return await new GBAttributeRoll(formula, {}, opts).evaluate()
}

class GBAttributeRoll extends Roll {
    constructor(formula, data, options = { difficulty: 'mortal' }) {
        let diffcultyModifier = 0
        switch (options.difficulty) {
            case 'Mortal': {
                diffcultyModifier = 0
                break
            }
            case 'PushLimits': {
                diffcultyModifier = 4
                break
            }
            case 'Heroic': {
                diffcultyModifier = 8
                break
            }
        }
        const checkRequirement = 21 - options.attributeValue + diffcultyModifier
        super(formula, data, { ...options, checkRequirement })
    }

    static CHAT_TEMPLATE = systemPath('templates/dice/saveRoll.html')
    static TOOLTIP_TEMPLATE = systemPath('templates/dice/tooltip.html')

    async render({
        template = this.constructor.CHAT_TEMPLATE,
        isPrivate = false,
    } = {}) {
        if (!this._evaluated)
            await this.evaluate({ allowInteractive: !isPrivate })
        const autoSuccess = this.number == 20
        const autoFailure = this.number == 1
        const chatData = {
            formula: isPrivate ? '???' : this._formula,
            flavor: isPrivate
                ? null
                : game.i18n.format(CONFIG.GODBOUND.AttributeCheckResult, {
                      attribute: this.options.attributeLabel,
                      checkTarget: this.options.checkRequirement,
                  }),
            user: game.user.id,
            tooltip: isPrivate ? '' : await this.getTooltip(),
            total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
            success: isPrivate
                ? '?'
                : !autoFailure &&
                  (autoSuccess || this.total >= this.options.checkRequirement),
        }
        return renderTemplate(template, chatData)
    }
}

class GBMoraleRoll extends Roll {
    constructor(_, data, options = { morale: 7 }) {
        const formula = '2d12'
        super(formula, data, options)
    }

    static CHAT_TEMPLATE = systemPath('templates/dice/saveRoll.html')
    static TOOLTIP_TEMPLATE = systemPath('templates/dice/tooltip.html')

    async render({
        template = this.constructor.CHAT_TEMPLATE,
        isPrivate = false,
    } = {}) {
        if (!this._evaluated)
            await this.evaluate({ allowInteractive: !isPrivate })
        const chatData = {
            formula: isPrivate ? '???' : this._formula,
            flavor: isPrivate
                ? null
                : game.i18n.format(CONFIG.GODBOUND.MoraleCheckResult, {
                      checkTarget: this.options.morale,
                  }),
            user: game.user.id,
            tooltip: isPrivate ? '' : await this.getTooltip(),
            total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
            success: isPrivate ? '?' : this.total <= this.options.morale,
        }
        return renderTemplate(template, chatData)
    }
}

export {
    GBAttributeRoll,
    GBAttackRoll,
    GBDamageRoll,
    GBHitRoll,
    GBMoraleRoll,
    GBSaveRoll,
}
