import GodboundAbilityCheck from "../dice/abilityCheck.mjs";

export default class GodboundChatMessage extends ChatMessage {
    constructor(data, options) {
        super(data, options);
    }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @inheritdoc */
  prepareDerivedData() {
    // super.prepareDerivedData();

    // Create Roll instances for contained dice rolls
    this.rolls = this.rolls.reduce((rolls, rollData) => {
      try {
        rolls.push(GodboundAbilityCheck.fromData(rollData));
      } catch(err) {
        Hooks.onError("ChatMessage#rolls", err, {rollData, log: "error"});
      }
      return rolls;
    }, []);
  }
}