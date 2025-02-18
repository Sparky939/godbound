/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    return loadTemplates([
        // Actor partials.
        'systems/godbound/templates/actor/parts/actor-facts.hbs',
        'systems/godbound/templates/actor/parts/actor-inventory.hbs',
        'systems/godbound/templates/actor/parts/actor-spells.hbs',
        'systems/godbound/templates/actor/parts/actor-effects.hbs',
        'systems/godbound/templates/actor/parts/actor-projects.hbs',
        'systems/godbound/templates/actor/parts/actor-powers.hbs',
        // Item partials
        'systems/godbound/templates/item/parts/item-effects.hbs',
        'systems/godbound/templates/item/parts/gifts-of-the-word.hbs',
    ])
}
