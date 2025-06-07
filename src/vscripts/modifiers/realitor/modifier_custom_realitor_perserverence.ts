import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";
import { modifier_custom_realitor_perserverence_effect } from "./modifier_custom_realitor_perserverence_effect";

@registerModifier()
export class modifier_custom_realitor_perserverence extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }

    IsAura(): boolean {
        return !this.GetCaster()?.PassivesDisabled();
    }

    GetModifierAura(): string {
        return modifier_custom_realitor_perserverence_effect.name;
    }

    GetAuraRadius(): number {
        return this.GetAbility()!.GetSpecialValueFor("radius");
    }

    GetAuraSearchTeam(): DOTA_UNIT_TARGET_TEAM {
        return UnitTargetTeam.FRIENDLY;
    }

    GetAuraSearchType(): DOTA_UNIT_TARGET_TYPE {
        return UnitTargetType.HERO + UnitTargetType.BASIC;
    }

    IsAuraActiveOnDeath(): boolean {
        return false;
    }
}