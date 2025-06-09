import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_custom_enigma_midnight_pulse_thinker extends BaseModifier {
    radius!: number;
    damage_percent!: number;
    tick_rate!: number;
    particle: ParticleID | undefined;

    IsHidden() { return true; }

    OnCreated(params: any): void {
        if (IsServer()) {
            const ability = this.GetAbility();
            if (!ability) return;

            this.radius = ability.GetSpecialValueFor("radius");
            this.damage_percent = ability.GetSpecialValueFor("damage_percent");
            this.tick_rate = ability.GetSpecialValueFor("tick_rate");

            GridNav.DestroyTreesAroundPoint(this.GetParent().GetOrigin(), this.radius, true);
            EmitSoundOn("Hero_Enigma.Midnight_Pulse", this.GetParent());

            this.particle = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_enigma/enigma_midnight_pulse.vpcf",
                ParticleAttachment.ABSORIGIN,
                this.GetParent()
            );

            ParticleManager.SetParticleControl(this.particle, 0, this.GetParent().GetOrigin());
            ParticleManager.SetParticleControl(this.particle, 1, Vector(this.radius, 0, 0));

            this.AddParticle(this.particle, false, false, -1, false, false);

            this.StartIntervalThink(this.tick_rate);
        }
    }

    OnIntervalThink(): void {
        const caster = this.GetCaster() as CDOTA_BaseNPC;

        const enemies = FindUnitsInRadius(
            caster.GetTeamNumber(),
            this.GetParent().GetOrigin(),
            undefined,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (const enemy of enemies) {
            if (!(enemy.IsAncient() && !enemy.IsCreepHero())) {
                ApplyDamage({
                    victim: enemy,
                    attacker: caster,
                    ability: this.GetAbility(),
                    damage: this.damage_percent * enemy.GetMaxHealth() * this.tick_rate / 100,
                    damage_type: DamageTypes.PURE,
                    damage_flags: DamageFlag.NONE
                });
            }
        }
    }

    OnDestroy(): void {
        if (this.particle && this.particle !== -1) {
            ParticleManager.ReleaseParticleIndex(this.particle);
        }
        StopSoundOn("Hero_Enigma.Midnight_Pulse", this.GetCaster() as CDOTA_BaseNPC);
    }
}
