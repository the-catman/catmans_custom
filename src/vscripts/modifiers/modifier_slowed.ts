import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_slowed extends BaseModifier {
    IsHidden(): boolean {
        return false;
    }
    IsDebuff(): boolean {
        return true;
    }
    IsPurgable(): boolean {
        return true;
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE];
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.GetStackCount();
    }

    OnCreated(params: any): void {
        if(IsServer()) this.SetStackCount(params.bonus_movement_speed);
    }
}