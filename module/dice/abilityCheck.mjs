import GodboundChatMessage from "../documents/chatMessage.mjs";

export default class GodboundAbilityCheck extends Roll {
  constructor(formula, data, options) {
    super(formula, data, options)
  }
  static CHAT_TEMPLATE = "systems/godbound/templates/dice/ability-check.html";
  /* -------------------------------------------- */

  /**
   * Render a Roll instance to HTML
   * @param {object} [options={}]               Options which affect how the Roll is rendered
   * @param {string} [options.flavor]             Flavor text to include
   * @param {string} [options.template]           A custom HTML template path
   * @param {boolean} [options.isPrivate=false]   Is the Roll displayed privately?
   * @returns {Promise<string>}                 The rendered HTML template as a string
   */
  async render({flavor, template=this.constructor.CHAT_TEMPLATE, isPrivate=false}={}) {
    if ( !this._evaluated ) await this.evaluate({async: true});
    const chatData = {
      formula: isPrivate ? "???" : this._formula,
      flavor: isPrivate ? null : flavor,
      user: game.user.id,
      tooltip: isPrivate ? "" : await this.getTooltip(),
      total: isPrivate ? "?" : Math.round(this.total * 100) / 100
    };
    return renderTemplate(template, chatData);
  }

  // /* -------------------------------------------- */

  // /**
  //  * Transform a Roll instance into a ChatMessage, displaying the roll result.
  //  * This function can either create the ChatMessage directly, or return the data object that will be used to create.
  //  *
  //  * @param {object} messageData          The data object to use when creating the message
  //  * @param {options} [options]           Additional options which modify the created message.
  //  * @param {string} [options.rollMode]   The template roll mode to use for the message from CONFIG.Dice.rollModes
  //  * @param {boolean} [options.create=true]   Whether to automatically create the chat message, or only return the
  //  *                                          prepared chatData object.
  //  * @returns {Promise<ChatMessage|object>} A promise which resolves to the created ChatMessage document if create is
  //  *                                        true, or the Object of prepared chatData otherwise.
  //  */
  // async toMessage(messageData={}, {rollMode, create=true}={}) {

  //   // Perform the roll, if it has not yet been rolled
  //   if ( !this._evaluated ) await this.evaluate({async: true});

  //   // Prepare chat data
  //   messageData = foundry.utils.mergeObject({
  //     user: game.user.id,
  //     type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  //     content: String(this.total),
  //     sound: CONFIG.sounds.dice
  //   }, messageData);
  //   messageData.rolls = [this];

  //   // Either create the message or just return the chat data
  //   const cls = GodboundChatMessage;
  //   const msg = new cls(messageData);

  //   // Either create or return the data
  //   if ( create ) return cls.create(msg.toObject(), { rollMode });
  //   else {
  //     if ( rollMode ) msg.applyRollMode(rollMode);
  //     return msg.toObject();
  //   }
  // }

  // /* -------------------------------------------- */

  // /**
  //  * Recreate a Roll instance using a provided data object
  //  * @param {object} data   Unpacked data representing the Roll
  //  * @returns {Roll}         A reconstructed Roll instance
  //  */
  // static fromData(data) {
  //   console.log('fromData', data)

  //   // Redirect to the proper Roll class definition
  //   if ( data.class && (data.class !== this.name) ) {
  //     const cls = CONFIG.Dice.rolls.find(cls => cls.name === data.class);
  //     if ( !cls ) throw new Error(`Unable to recreate ${data.class} instance from provided data`);
  //     return cls.fromData(data);
  //   }

  //   // Create the Roll instance
  //   const roll = new this(data.formula, data.data, data.options);

  //   // Expand terms
  //   roll.terms = data.terms.map(t => {
  //     if ( t.class ) {
  //       if ( t.class === "DicePool" ) t.class = "PoolTerm"; // Backwards compatibility
  //       return RollTerm.fromData(t);
  //     }
  //     return t;
  //   });

  //   // Repopulate evaluated state
  //   if ( data.evaluated ?? true ) {
  //     roll._total = data.total;
  //     roll._dice = (data.dice || []).map(t => DiceTerm.fromData(t));
  //     roll._evaluated = true;
  //   }
  //   return roll;
  // }
  
}