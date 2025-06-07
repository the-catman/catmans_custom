import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";
import { modifier_custom_realitor_perserverence } from "../../modifiers/realitor/modifier_custom_realitor_perserverence";

@registerAbility()
export class custom_realitor_perserverence extends BaseAbility {
    GetAOERadius(): number {
        return this.GetSpecialValueFor("radius");
    }

    GetIntrinsicModifierName(): string {
        return modifier_custom_realitor_perserverence.name;
    }
}