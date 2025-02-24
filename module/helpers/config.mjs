export const GODBOUND = {}

export function getGlobalWords() {
    return game.items.filter((i) => i.type === 'word')
}

/**
 * The set of Attribute Scores used `within the system.
 * @type {Object}
 */
GODBOUND.attributes = {
    str: 'GODBOUND.Attribute.Str.long',
    dex: 'GODBOUND.Attribute.Dex.long',
    con: 'GODBOUND.Attribute.Con.long',
    int: 'GODBOUND.Attribute.Int.long',
    wis: 'GODBOUND.Attribute.Wis.long',
    cha: 'GODBOUND.Attribute.Cha.long',
}

GODBOUND.abilityAbbreviations = {
    str: 'GODBOUND.Attribute.Str.abbr',
    dex: 'GODBOUND.Attribute.Dex.abbr',
    con: 'GODBOUND.Attribute.Con.abbr',
    int: 'GODBOUND.Attribute.Int.abbr',
    wis: 'GODBOUND.Attribute.Wis.abbr',
    cha: 'GODBOUND.Attribute.Cha.abbr',
}

GODBOUND.resources = {
    health: 'GODBOUND.Resource.Health',
    effort: 'GODBOUND.Resource.Effort',
    influence: 'GODBOUND.Resource.Influence',
    dominion: 'GODBOUND.Resource.Dominion',
    wealth: 'GODBOUND.Resource.Wealth',
}

GODBOUND.saves = {
    hardiness: 'GODBOUND.Save.Hardiness',
    evasion: 'GODBOUND.Save.Evasion',
    spirit: 'GODBOUND.Save.Spirit',
}

GODBOUND.difficulties = {
    Mortal: 'GODBOUND.Difficulty.Mortal',
    PushLimits: 'GODBOUND.Difficulty.PushLimits',
    Heroic: 'GODBOUND.Difficulty.Heroic',
}
GODBOUND.powerTypes = {
    Gift: 'GODBOUND.PowerType.Gift',
    Word: 'GODBOUND.PowerType.Word',
}

GODBOUND.rollTypes = {
    Normal: 'GODBOUND.RollType.Normal',
    Advantage: 'GODBOUND.RollType.Advantage',
    Disadvantage: 'GODBOUND.RollType.Disadvantage',
}

GODBOUND.itemTypes = {
    Weapon: 'GODBOUND.ItemTypes.Weapon',
    Armour: 'GODBOUND.ItemTypes.Armour',
    Item: 'GODBOUND.ItemTypes.Item',
    Fact: 'GODBOUND.ItemTypes.Fact',
    Spell: 'GODBOUND.ItemTypes.Spell',
    Armour: 'GODBOUND.ItemTypes.Armour',
    Weapon: 'GODBOUND.ItemTypes.Weapon',
    Word: 'GODBOUND.ItemTypes.Word',
    Gift: 'GODBOUND.ItemTypes.Gift',
}

GODBOUND.ArmourTypes = {
    None: 'GODBOUND.ArmourTypes.None',
    Light: 'GODBOUND.ArmourTypes.Light',
    Medium: 'GODBOUND.ArmourTypes.Medium',
    Heavy: 'GODBOUND.ArmourTypes.Heavy',
}
GODBOUND.WeaponTypes = {
    unarmed: 'GODBOUND.Weapon.Unarmed',
    light: 'GODBOUND.Weapon.Light',
    medium: 'GODBOUND.Weapon.Medium',
    heavy: 'GODBOUND.Weapon.Heavy',
    ranged1h: 'GODBOUND.Weapon.OneHandedRanged',
    ranged2h: 'GODBOUND.Weapon.TwoHandedRanged',
    custom: 'GODBOUND.Weapon.Custom',
}

GODBOUND.gifts = {
    power: {
        lesser: 'GODBOUND.Item.Gift.Power.Lesser',
        greater: 'GODBOUND.Item.Gift.Power.Greater',
    },
    type: {
        passive: 'GODBOUND.Item.Gift.Type.Passive',
        instant: 'GODBOUND.Item.Gift.Type.Instant',
        turn: 'GODBOUND.Item.Gift.Type.Turn',
        action: 'GODBOUND.Item.Gift.Type.Action',
    },
}
GODBOUND.spells = {
    level: {
        Apprentice: 'GODBOUND.Item.Spell.Level.Apprentice',
        Adept: 'GODBOUND.Item.Spell.Level.Adept',
        Master: 'GODBOUND.Item.Spell.Level.Master',
        Archmage: 'GODBOUND.Item.Spell.Level.Archmage',
    },
}
GODBOUND.frayDice = {
    4: 'GODBOUND.FrayDice.4',
    6: 'GODBOUND.FrayDice.6',
    8: 'GODBOUND.FrayDice.8',
    10: 'GODBOUND.FrayDice.10',
    12: 'GODBOUND.FrayDice.12',
}
GODBOUND.DamageDiceSizes = {
    2: 'GODBOUND.DamageDiceSizes.2',
    4: 'GODBOUND.DamageDiceSizes.4',
    6: 'GODBOUND.DamageDiceSizes.6',
    8: 'GODBOUND.DamageDiceSizes.8',
    10: 'GODBOUND.DamageDiceSizes.10',
    12: 'GODBOUND.DamageDiceSizes.12',
    20: 'GODBOUND.DamageDiceSizes.20',
}
GODBOUND.SheetModes = {
    edit: 'GODBOUND.SheetModes.Edit',
    view: 'GODBOUND.SheetModes.View',
    compact: 'GODBOUND.SheetModes.Compact',
}

GODBOUND.AttributePromptTitle = 'GODBOUND.AttributePromptTitle'
GODBOUND.AttributeCheckResult = 'GODBOUND.AttributeCheckResult'
GODBOUND.PowerCreatePromptTitle = 'GODBOUND.PowerCreatePromptTitle'
GODBOUND.SaveCheckResult = 'GODBOUND.SaveCheckResult'
GODBOUND.NPCSaveCheckResult = 'GODBOUND.NPCSaveCheckResult'
GODBOUND.SavePromptTitle = 'GODBOUND.SavePromptTitle'
GODBOUND.AttackResult = 'GODBOUND.AttackResult'
GODBOUND.DamageResult = 'GODBOUND.DamageResult'
GODBOUND.DifficultyPrompt = 'GODBOUND.DifficultyPrompt'

GODBOUND.RollMode = 'GODBOUND.RollMode'
GODBOUND.RelevantFactPrompt = 'GODBOUND.RelevantFactPrompt'
GODBOUND.RollExample = 'GODBOUND.RollExample'
GODBOUND.Roll = 'GODBOUND.Roll'
GODBOUND.Create = 'GODBOUND.Create'
