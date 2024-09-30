export const GODBOUND = {};

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
};

GODBOUND.abilityAbbreviations = {
  str: 'GODBOUND.Attribute.Str.abbr',
  dex: 'GODBOUND.Attribute.Dex.abbr',
  con: 'GODBOUND.Attribute.Con.abbr',
  int: 'GODBOUND.Attribute.Int.abbr',
  wis: 'GODBOUND.Attribute.Wis.abbr',
  cha: 'GODBOUND.Attribute.Cha.abbr',
};

GODBOUND.saves = {
  hardiness: 'GODBOUND.Save.Hardiness',
  evasion: 'GODBOUND.Save.Evasion',
  spirit: 'GODBOUND.Save.Spirit'
};

GODBOUND.difficulties = {
  Mortal: 'GODBOUND.Difficulty.Mortal',
  PushLimits: 'GODBOUND.Difficulty.PushLimits',
  Heroic: 'GODBOUND.Difficulty.Heroic',
}

GODBOUND.itemTypes = {
  Weapon: 'GODBOUND.ItemTypes.Weapon',
  Armour: 'GODBOUND.ItemTypes.Armour',
  Item: 'GODBOUND.ItemTypes.Item',
  Fact: 'GODBOUND.ItemTypes.Fact',
  Spell: 'GODBOUND.ItemTypes.Spell',
  Armour: 'GODBOUND.ItemTypes.Armour',
}

GODBOUND.ArmourTypes = {
  None: 'GODBOUND.ArmourTypes.None',
  Light: 'GODBOUND.ArmourTypes.Light',
  Medium: 'GODBOUND.ArmourTypes.Medium',
  Heavy: 'GODBOUND.ArmourTypes.Heavy',
}

GODBOUND.AttributePromptTitle = 'GODBOUND.AttributePromptTitle';
GODBOUND.AttributeCheckResult = 'GODBOUND.AttributeCheckResult';

GODBOUND.DifficultyPrompt = 'GODBOUND.DifficultyPrompt';

GODBOUND.RollMode = 'GODBOUND.RollMode';
GODBOUND.RelevantFactPrompt = 'GODBOUND.RelevantFactPrompt';
GODBOUND.RollExample = 'GODBOUND.RollExample';
GODBOUND.Roll = 'GODBOUND.Roll';