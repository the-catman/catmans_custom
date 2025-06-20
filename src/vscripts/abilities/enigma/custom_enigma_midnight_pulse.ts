import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";
import { modifier_custom_enigma_midnight_pulse_thinker } from "../../modifiers/engima/modifier_custom_enigma_midnight_pulse_thinker";

@registerAbility()
export class custom_enigma_midnight_pulse extends BaseAbility {
    sound_cast: string = "Hero_Enigma.Midnight_Pulse";
    particle_cast: string = "particles/units/heroes/hero_enigma/enigma_midnight_pulse.vpcf";

    GetAOERadius(): number {
        return this.GetSpecialValueFor("radius");
    }

    OnSpellStart(): void {
        const caster = this.GetCaster();
        
        CreateModifierThinker(
            caster,
            this,
            modifier_custom_enigma_midnight_pulse_thinker.name,
            { duration: this.GetSpecialValueFor("duration") },
            this.GetCursorPosition(),
            caster.GetTeamNumber(),
            false
        );
    }
}