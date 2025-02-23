import { getGlobalWords, GODBOUND } from '../helpers/config.mjs'
import {
    onManageActiveEffect,
    prepareActiveEffectCategories,
} from '../helpers/effects.mjs'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class GodboundItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['godbound', 'sheet', 'item'],
            width: 520,
            height: 480,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'description',
                },
            ],
        })
    }

    /** @override */
    get template() {
        const path = 'systems/godbound/templates/item'
        // Return a single sheet for all item types.
        // return `${path}/item-sheet.hbs`;
        // Alternatively, you could use the following return statement to do a
        // unique item sheet by type, like `weapon-sheet.hbs`.
        return `${path}/item-${this.item.type}-sheet.hbs`
    }

    /* -------------------------------------------- */

    /** @override */
    async getData() {
        // Retrieve base data structure.
        const context = super.getData()

        // Use a safe clone of the item data for further operations.
        const itemData = this.document.toPlainObject()

        // Enrich description info for display
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedDescription = await TextEditor.enrichHTML(
            this.item.system.description,
            {
                // Whether to show secret blocks in the finished html
                secrets: this.document.isOwner,
                // Necessary in v11, can be removed in v12
                async: true,
                // Data to fill in for inline rolls
                rollData: this.item.getRollData(),
                // Relative UUID resolution
                relativeTo: this.item,
            }
        )

        // Add the item's data to context.data for easier access, as well as flags.
        context.system = itemData.system
        context.flags = itemData.flags
        const ownerType = context.item.parent?.type ?? 'global'
        context.characterItem = ownerType === 'character'
        context.npcItem = ownerType === 'npc'
        context.globalItem = ownerType === 'global'
        context.words = this.getWords().reduce((acc, i) => {
            acc[i._id] = i.name
            return acc
        }, {})
        // Adding a pointer to CONFIG.GODBOUND
        context.config = CONFIG.GODBOUND

        // Prepare active effects for easier access
        context.effects = prepareActiveEffectCategories(this.item.effects)
        if (this.item.type === 'gift') {
            context.powerLabel =
                GODBOUND.gifts.power[context.system.power.value] ??
                'GODBOUND.Item.Gift.Power.Lesser'
            context.typeLabel =
                GODBOUND.gifts.type[context.system.type.value] ??
                'GODBOUND.Item.Gift.Type.Action'
            if (context.characterItem && context.item.actor) {
                const word = this.getWords().find(
                    (i) => i._id === context.item.system.word.id
                )
                if (word) {
                    context.wordName = word.name
                }
            }
        }

        return context
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html)

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return

        // Roll handlers, click handlers, etc. would go here.

        // Active Effect management
        html.on('click', '.effect-control', (ev) =>
            onManageActiveEffect(ev, this.item)
        )
    }
    getWords() {
        var items = this.item.actor?.items
        return (items ?? getGlobalWords())
            .filter((i) => i.type === 'word')
            .sort((a, b) => a.name.localeCompare(b.name))
    }
}
