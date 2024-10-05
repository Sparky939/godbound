export const tables = {}

tables.attr = [
    { score: { min: 3, max: 3 }, modifier: -3 },
    { score: { min: 4, max: 5 }, modifier: -2 },
    { score: { min: 6, max: 8 }, modifier: -1 },
    { score: { min: 9, max: 12 }, modifier: 0 },
    { score: { min: 13, max: 15 }, modifier: 1 },
    { score: { min: 16, max: 17 }, modifier: 2 },
    { score: { min: 18, max: 18 }, modifier: 3 },
    { score: { min: 19, max: 19 }, modifier: 4 },
]

tables.damage = [
    { roll: { min: undefined, max: 1 }, damage: 0 },
    { roll: { min: 2, max: 5 }, damage: 1 },
    { roll: { min: 6, max: 9 }, damage: 2 },
    { roll: { min: 10, max: undefined }, damage: 4 },
]

tables.advancement = [
    { level: 1, requirements: { xp: 0, dominionSpent: 0 } },
    { level: 2, requirements: { xp: 3, dominionSpent: 2 } },
    { level: 3, requirements: { xp: 6, dominionSpent: 4 } },
    { level: 4, requirements: { xp: 12, dominionSpent: 10 } },
    { level: 5, requirements: { xp: 24, dominionSpent: 22 } },
    { level: 6, requirements: { xp: 48, dominionSpent: 38 } },
    { level: 7, requirements: { xp: 72, dominionSpent: 57 } },
    { level: 8, requirements: { xp: 96, dominionSpent: 76 } },
    { level: 9, requirements: { xp: 130, dominionSpent: 95 } },
    { level: 10, requirements: { xp: 170, dominionSpent: 124 } },
]

tables.weapons = [
    {
        value: 'unarmed',
        label: 'GODBOUND.Weapon.Unarmed',
        damage: '1d2',
        attribute: ['str', 'dex'],
    },
    {
        value: 'light',
        label: 'GODBOUND.Weapon.Light',
        damage: '1d6',
        attribute: ['str', 'dex'],
    },
    {
        value: 'medium',
        label: 'GODBOUND.Weapon.Medium',
        damage: '1d8',
        attribute: ['str'],
    },
    {
        value: 'heavy',
        label: 'GODBOUND.Weapon.Heavy',
        damage: '1d10',
        attribute: ['str'],
    },
    {
        value: 'ranged1h',
        label: 'GODBOUND.Weapon.OneHandedRanged',
        damage: '1d6',
        attribute: ['dex'],
    },
    {
        value: 'ranged2h',
        label: 'GODBOUND.Weapon.TwoHandedRanged',
        damage: '1d8',
        attribute: ['dex'],
    },
]
