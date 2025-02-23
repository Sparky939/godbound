import { onManageActiveEffect } from '../helpers/effects.mjs'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class GodboundCharacterActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['godbound', 'sheet', 'actor', 'character'],
            width: 600,
            height: 600,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'facts',
                },
            ],
        })
    }

    /** @override */
    get template() {
        return `systems/godbound/templates/actor/actor-character-sheet.hbs`
    }

    /* -------------------------------------------- */

    /** @override */
    async getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const context = super.getData()

        // Use a safe clone of the actor data for further operations.
        const actorData = this.document.toPlainObject()

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system
        context.flags = actorData.flags

        // Adding a pointer to CONFIG.GODBOUND
        context.config = CONFIG.GODBOUND

        // Prepare character data and items.
        this._prepareItems(context)
        this._prepareCharacterData(context)

        // Enrich biography info for display
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedBiography = await TextEditor.enrichHTML(
            this.actor.system.biography,
            {
                // Whether to show secret blocks in the finished html
                secrets: this.document.isOwner,
                // Necessary in v11, can be removed in v12
                async: true,
                // Data to fill in for inline rolls
                rollData: this.actor.getRollData(),
                // Relative UUID resolution
                relativeTo: this.actor,
            }
        )

        return context
    }

    /**
     * Character-specific context modifications
     *
     * @param {object} context The context object to mutate
     */
    _prepareCharacterData(context) {
        // This is where you can enrich character-specific editor fields
        // or setup anything else that's specific to this type
        context.dominionAvailable =
            context.system.resources.dominion.gained -
            context.system.resources.dominion.spent
        const wornArmour = context.armours.find((a) => a.system.worn)
        if (wornArmour) {
            context.ac =
                wornArmour.system.baseArmour -
                context.system.attributes.dex.mod -
                (context.system.useShield ? 1 : 0)
            context.system.saves.hardiness.penalty =
                wornArmour.system.hardinessPenalty
            context.system.saves.evasion.penalty =
                wornArmour.system.evasionPenalty
            context.system.saves.spirit.penalty =
                wornArmour.system.spiritPenalty
        } else {
            context.ac =
                9 -
                context.system.attributes.dex.mod -
                (context.system.useShield ? 1 : 0)
            context.system.saves.hardiness.penalty = false
            context.system.saves.evasion.penalty = false
            context.system.saves.spirit.penalty = false
        }
    }

    /**
     * Organize and classify Items for Actor sheets.
     *
     * @param {object} context The context object to mutate
     */
    _prepareItems(context) {
        // Initialize containers.
        const items = []
        const weapons = []
        const armours = []
        const facts = []
        const projects = []
        const spells = {
            Apprentice: [],
            Adept: [],
            Master: [],
            Archmage: [],
        }
        const words = []
        const gifts = []
        // Iterate through items, allocating to containers
        for (let i of context.items) {
            i.img = i.img || Item.DEFAULT_ICON
            if (i.type === 'item') {
                items.push(i)
            }
            if (i.type === 'weapon') {
                weapons.push(i)
            }
            if (i.type === 'armour') {
                armours.push(i)
            }
            if (i.type === 'word') {
                words.push(i)
            }
            if (i.type === 'gift') {
                gifts.push(i)
            }
            if (i.type === 'project') {
                projects.push(i)
            }
            // Append to facts.
            else if (i.type === 'fact') {
                facts.push(i)
            }
            // Append to spells.
            else if (i.type === 'spell') {
                Object.keys(CONFIG.GODBOUND.spells.level)
                if (i.system.spellLevel != undefined) {
                    spells[i.system.spellLevel].push(i)
                }
            }
        }

        // Assign and return
        context.items = items
        context.weapons = weapons
        context.armours = armours
        context.facts = facts
        context.spells = spells
        context.projects = projects
        context.words = words
        context.gifts = gifts
        context.effects = words
            .concat(gifts)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((i) => {
                return {
                    ...i,
                    name: i.type == 'word' ? `${i.name} Miracles` : i.name,
                }
            })
            .filter((i) => i.system.effort > 0)
        var unboundGifts = gifts.sort((a, b) => a.name.localeCompare(b.name))
        context.powers = [
            ...words,
            { name: 'Unbound Gifts', type: 'word', unbound: true },
        ]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((word) => {
                const gifts = unboundGifts.filter((g) => {
                    return (
                        g.system.word.id == word._id ||
                        word.name == 'Unbound Gifts'
                    )
                })
                unboundGifts = unboundGifts.filter((g) => {
                    return g.system.word.id != word._id
                })
                return {
                    word: {
                        ...word,
                        unbound: word.unbound,
                        show: word.unbound && gifts.length > 0,
                    },
                    gifts: gifts
                        .filter((g) => {
                            return (
                                g.system.word.id == word._id ||
                                word.name == 'Unbound Gifts'
                            )
                        })
                        .sort((a, b) => a.name.localeCompare(b.name)),
                }
            })
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html)

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return
        html.on('click', '.clickable', this._handleClick.bind(this))
        html.on('contextmenu', '.clickable', this._handleRClick.bind(this))

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = (ev) => this._onDragStart(ev)
            html.find('li.item').each((i, li) => {
                if (li.classList.contains('inventory-header')) return
                li.setAttribute('draggable', true)
                li.addEventListener('dragstart', handler, false)
            })
        }
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    async _onItemCreate(_element, dataset) {
        // Get the type of item to create.
        const type = dataset.type
        // Grab any data associated with this control.
        const data = foundry.utils.duplicate(dataset)
        // Initialize a default name.
        const name = `New ${type.capitalize()}`
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            system: data,
        }
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system['type']

        // Finally, create the item!
        return await Item.create(itemData, { parent: this.actor })
    }
    async _onGiftCreate(_element, dataset) {
        const type = dataset.type
        const name = `New ${type.capitalize()}`
        const giftData = {
            name,
            type,
            system: {
                dropdown: true,
                word: {
                    id: dataset.wordId,
                    name: dataset.wordName,
                },
                power: {
                    value: 'lesser',
                    label: 'GODBOUND.Item.Gift.Power.Lesser',
                },
                type: {
                    value: 'action',
                    label: 'GODBOUND.Item.Gift.Type.Action',
                },
            },
        }
        return await Item.create(giftData, { parent: this.actor })
    }
    _onItemDelete(element) {
        const li = $(element).parents('.item')
        const item = this.actor.items.get(li.data('itemId'))
        item.delete()
        li.slideUp(200, () => this.render(false))
    }
    _onItemEdit(element, _dataset) {
        const li = $(element).parents('.item')
        const item = this.actor.items.get(li.data('itemId'))
        item.sheet.render(true)
    }

    /**
     * Handle clickable expandables.
     * @param {Event} event   The originating click event
     * @private
     */
    _handleClick(event) {
        event.preventDefault()
        const element = event.currentTarget
        const dataset = element.dataset
        switch (dataset.clickType) {
            case 'print': {
                return this._onPrint(element, dataset)
            }
            case 'toggle-shield': {
                return this._onShieldToggle(element, dataset)
            }
            case 'expand': {
                return this._onExpand(element, dataset)
            }
            case 'roll': {
                return this._onRoll(element, dataset)
            }
            case 'attribute-check': {
                return this._onAttributeCheck(element, dataset)
            }
            case 'save-check': {
                return this._onSaveCheck(element, dataset)
            }
            case 'fray-die': {
                return this._rollFrayDie(element, dataset)
            }
            case 'increment-effort': {
                return this._onEffortIncrement(element, dataset)
            }
            case 'clear-effort': {
                return this._onEffortClear(element, dataset)
            }
            case 'create-gift': {
                return this._onGiftCreate(element, dataset)
            }
            case 'item-create': {
                return this._onItemCreate(element, dataset)
            }
            case 'item-edit': {
                return this._onItemEdit(element, dataset)
            }
            case 'item-delete': {
                return this._onItemDelete(element, dataset)
            }
            case 'effect-control': {
                return this._onEffectControl(element, dataset)
            }
            case 'equip': {
                return this._onEquip(element, dataset)
            }
        }
    }
    _handleRClick(event) {
        event.preventDefault()
        const element = event.currentTarget
        const dataset = element.dataset
        switch (dataset.context) {
            case 'decrement-effort': {
                return this._onEffectDecrement(element, dataset)
            }
        }
    }
    _onEffortIncrement(_element, dataset) {
        if (this.actor.system.resources.effort.value > 0) {
            const item = this.actor.items.get(dataset.itemId)
            item.update({ 'system.effort': item.system.effort + 1 })
        }
    }
    _onEffectDecrement(_element, dataset) {
        const item = this.actor.items.get(dataset.itemId)
        const newEffort = Math.max(item.system.effort - 1, 0)
        item.update({
            'system.effort': newEffort,
        })
    }
    _onEffortClear(_element, dataset) {
        const item = this.actor.items.get(dataset.itemId)
        item.update({ 'system.effort': 0 })
    }
    _onExpand(_element, dataset) {
        const item = this.actor.items.get(dataset.itemId)
        item.update({ 'system.dropdown': !item.system.dropdown })
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    _onRoll(element, dataset) {
        // Handle item rolls.
        if (dataset.rollType) {
            if (dataset.rollType == 'item') {
                const itemId = element.closest('.item').dataset.itemId
                const item = this.actor.items.get(itemId)
                if (item) return item.roll()
            }
            if (dataset.rollType == 'weapon') {
                const itemId = element.closest('.item').dataset.itemId
                const item = this.actor.items.get(itemId)
                if (item) {
                    return this.actor.system.attack(item)
                }
            }
        }

        // Handle rolls that supply the formula directly.
        if (dataset.roll) {
            let label = dataset.label ? `[attribute] ${dataset.label}` : ''
            let roll = new Roll(dataset.roll, this.actor.getRollData())
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
            })
            return roll
        }
    }

    _onPrint(element, _dataset) {
        const itemId = element.closest('.item').dataset.itemId
        const item = this.actor.items.get(itemId)
        if (item)
            return item.system.print({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            })
    }
    _onShieldToggle(_element, _dataset) {
        return this.actor.system.toggleShield()
    }

    _onEquip(_element, dataset) {
        return this.actor.system.wearArmour(dataset.id)
    }
    _onEffectControl(element) {
        const row = element.closest('li')
        const document =
            row.dataset.parentId === this.actor.id
                ? this.actor
                : this.actor.items.get(row.dataset.parentId)
        onManageActiveEffect(element, document)
    }

    async _onAttributeCheck(_element, dataset) {
        const attributeId = dataset.attribute
        return this.actor.system.attributeCheck(attributeId, {})
    }
    async _onSaveCheck(_element, dataset) {
        const saveId = dataset.attribute
        return this.actor.system.saveCheck(saveId, {})
    }
    async _rollFrayDie() {
        return this.actor.system.rollFrayDie()
    }
}
