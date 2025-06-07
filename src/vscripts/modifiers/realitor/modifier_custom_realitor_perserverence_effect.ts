import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_custom_realitor_perserverence_effect extends BaseModifier {
    IsHidden(): boolean {
        return false;
    }
    
    IsDebuff(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return false;
    }

    OnCreated(params: object): void {
        if(IsServer()) {
            this.SetStackCount(this.GetAbility()!.GetSpecialValueFor("resistance") * (this.GetCaster() === this.GetParent() ? 1 : this.GetAbility()!.GetSpecialValueFor("ally_bonus") / 100));
        }
    }

    OnRefresh(params: object): void {
        this.OnCreated(params);
    }

    OnDestroy(): void {
        if(IsServer()) this.SetStackCount(0);
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.STATUS_RESISTANCE, ModifierFunction.MAGICAL_RESISTANCE_BONUS];
    }

    GetModifierStatusResistance(): number {
        return this.GetStackCount();
    }

    GetModifierMagicalResistanceBonus(event: ModifierAttackEvent): number {
        return this.GetStackCount();
    }

}