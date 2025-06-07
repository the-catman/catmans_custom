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
        const duration = this.GetSpecialValueFor("duration");

        const caster = this.GetCaster();
        const point = this.GetCursorPosition();

        CreateModifierThinker(
            caster,
            this,
            modifier_custom_enigma_midnight_pulse_thinker.name,
            { duration },
            point,
            caster.GetTeamNumber(),
            false
        );
    }
}