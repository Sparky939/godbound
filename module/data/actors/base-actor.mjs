import GodboundDataModel from "../base-model.mjs";

export default class GodboundActorBase extends GodboundDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    return schema;
  }

  async attackRoll(modifier, dieSize) {
    const rolls = await new Promise.all([new Roll(`d20 +${modifier}`).evaluate(), new Roll(`d${dieSize} + ${modifier}`).evaluate()]);
    const autoHit = rolls[0].number == 20;
    const autoMiss = rolls[0].number == 1;
    const attackResult = 20 - rolls[0].total;
    const targetAc = autoHit ? "HIT" : attackResult > 9 || autoMiss ? 'MISS' : `AC ${attackResult} or less`;
    const damage = rolls[1].total;
    // TODO: need to pass multiple rolls to chat - requires specific roll manager or custom ChatMessage call
  }

}