import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_custom_hpregen extends BaseModifier {
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
        return [ModifierFunction.HEALTH_REGEN_PERCENTAGE];
    }

    GetModifierHealthRegenPercentage(): number {
        return 0.1;
    }
}