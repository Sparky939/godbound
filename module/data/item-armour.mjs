import GodboundItem from "./item-item.mjs";

export default class GodboundArmour extends GodboundItem {
    static defineSchema() {
        const fields = foundry.data.fields
        const requiredInteger = { required: true, nullable: false, integer: true }
        const schema = super.defineSchema()
    
        schema.baseArmour = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
        schema.type = new fields.StringField({ initial: "None", choices: CONFIG.GODBOUND.armourTypes });
        schema.worn = new fields.BooleanField({ initial: false });
    
        return schema
    }
}