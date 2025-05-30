import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_custom_mpregen extends BaseModifier {
    IsHidden(): boolean {
        return false;
    }

    IsDebuff(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return false;
    }
    
    RemoveOnDeath(): boolean {
        return true;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.MANA_REGEN_TOTAL_PERCENTAGE];
    }

    GetModifierTotalPercentageManaRegen(): number {
        return 0.05;
    }
}