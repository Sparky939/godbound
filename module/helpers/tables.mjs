export const LEVEL_REQUIREMENTS = [
    { xp: 0, dp: 0 },
    { xp: 3, dp: 2 },
    { xp: 6, dp: 4 },
    { xp: 12, dp: 10 },
    { xp: 24, dp: 22 },
    { xp: 48, dp: 38 },
    { xp: 72, dp: 57 },
    { xp: 96, dp: 76 },
    { xp: 130, dp: 95 },
    { xp: 170, dp: 124 },
];

export const ATTRIBUTE_MODIFIERS = [
    { max: 3, min: 3, mod: -3 },
    { max: 5, min: 4, mod: -2 },
    { max: 8, min: 6, mod: -1 },
    { max: 12, min: 9, mod: 0 },
    { max: 15, min: 13, mod: 1 },
    { max: 17, min: 16, mod: 2 },
    { max: 18, min: 18, mod: 3 },
    { max: 19, min: 19, mod: 4 }
];

export const ARMOR_TYPES = [
    {
        value: 'none',
        label: 'GODBOUND.Armor.None',
        baseAC: 9,
        penalties: 0
    },
    {
        value: 'light',
        label: 'GODBOUND.Armor.Light',
        baseAC: 7,
        penalties: 0
    },
    {
        value: 'medium',
        label: 'GODBOUND.Armor.Medium',
        baseAC: 5,
        penalties: 1
    },
    {
        value: 'heavy',
        label: 'GODBOUND.Armor.Heavy',
        baseAC: 3,
        penalties: 2
    }
];

export const WEAPON_TYPES = [
    {
        value: "unarmed",
        label: "GODBOUND.Weapon.Unarmed",
        damage: "1d2",
        attribute: ["str", "dex"]
    },
    {
        value: "light",
        label: "GODBOUND.Weapon.Light",
        damage: "1d6",
        attribute: ["str", "dex"]
    },
    {
        value: "medium",
        label: "GODBOUND.Weapon.Medium",
        damage: "1d8",
        attribute: ["str"]
    },
    {
        value: "heavy",
        label: "GODBOUND.Weapon.Heavy",
        damage: "1d10",
        attribute: ["str"]
    },
    {
        value: "ranged1h",
        label: "GODBOUND.Weapon.OneHandedRanged",
        damage: "1d6",
        attribute: ["dex"]
    },
    {
        value: "ranged2h",
        label: "GODBOUND.Weapon.TwoHandedRanged",
        damage: "1d8",
        attribute: ["dex"]
    }
]