/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class GodboundNPCActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['godbound', 'sheet', 'actor', 'npc'],
            width: 600,
            height: 435,
            tabs: [
                {
                    navSelector: '.npc-tabs',
                    contentSelector: '.content',
                    initial: 'description',
                },
            ],
        })
    }

    /** @override */
    get template() {
        return `systems/godbound/templates/actor/actor-npc-sheet.hbs`
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
        context.editToggleIcon =
            actorData.system.settings.mode === 'edit'
                ? 'fa-magnifying-glass'
                : 'fa-pen'
        this._prepareItems(context)
        context.editMode = actorData.system.settings.mode === 'edit'
        context.viewMode = actorData.system.settings.mode === 'view'
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
     * Organize and classify Items for Actor sheets.
     *
     * @param {object} context The context object to mutate
     */
    _prepareItems(context) {
        // Initialize containers
        const tactics = []
        const words = []
        const gifts = []
        // Iterate through items, allocating to containers
        for (let i of context.items) {
            i.img = i.img || Item.DEFAULT_ICON
            if (i.type === 'word') {
                words.push(i)
            }
            if (i.type === 'gift') {
                gifts.push(i)
            }
            if (i.type === 'tactic') {
                tactics.push(i)
            }
        }
        context.tactics = tactics
        // // Assign and return
        // context.words = words
        // context.gifts = gifts
        // context.effects = words
        //     .concat(gifts)
        //     .sort((a, b) => a.name.localeCompare(b.name))
        //     .map((i) => {
        //         return {
        //             ...i,
        //             name: i.type == 'word' ? `${i.name} Miracles` : i.name,
        //         }
        //     })
        //     .filter((i) => i.system.effort > 0)
        // context.powers = words
        //     .sort((a, b) => a.name.localeCompare(b.name))
        //     .map((word) => {
        //         return {
        //             word,
        //             gifts: gifts
        //                 .filter((g) => {
        //                     return g.system.word.id == word._id
        //                 })
        //                 .sort((a, b) => a.name.localeCompare(b.name)),
        //         }
        //     })
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
        const element = event.currentTarget
        const dataset = element.dataset
        if (
            dataset.clickType &&
            (dataset.disabled == undefined || !dataset.disabled)
        ) {
            event.preventDefault()
            switch (dataset.clickType) {
                case 'toggle-mode': {
                    return this._toggleMode(element, dataset)
                }
                case 'print': {
                    return this._onPrint(element, dataset)
                }
                case 'expand': {
                    return this._onExpand(element, dataset)
                }
                case 'attack': {
                    return this.actor.system.attack()
                }
                case 'save-check': {
                    return this.actor.system.save()
                }
                case 'morale-check': {
                    return this.actor.system.morale()
                }
                case 'increment-effort': {
                    return this._onEffortIncrement(element, dataset)
                }
                case 'clear-effort': {
                    return this._onEffortClear(element, dataset)
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
    _toggleMode() {
        this.actor.update({
            'system.settings.mode':
                this.actor.system.settings.mode === 'edit' ? 'view' : 'edit',
        })
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
    _onPrint(element, _dataset) {
        const itemId = element.closest('.item').dataset.itemId
        const item = this.actor.items.get(itemId)
        if (item)
            return item.system.print({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            })
    }
    async _onSaveCheck(_element, dataset) {
        const saveId = dataset.attribute
        return this.actor.system.saveCheck(saveId, {})
    }
}
