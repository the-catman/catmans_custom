import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_custom_enigma_midnight_pulse_thinker extends BaseModifier {
    radius!: number;
    damage!: number;
    tick_rate!: number;
    particle: ParticleID | undefined;
    origin!: Vector;
    ability!: CDOTABaseAbility;
    caster!: CDOTA_BaseNPC;
    teamNumber!: DOTATeam_t;
    tick_skip: number = 0;

    IsHidden() { return true; }

    OnCreated(params: any): void {
        if (IsServer()) {
            this.ability = this.GetAbility() as CDOTABaseAbility;
            this.radius = this.ability.GetSpecialValueFor("radius");
            this.damage = this.ability.GetSpecialValueFor("damage");
            this.tick_rate = this.ability.GetSpecialValueFor("tick_rate");
            this.origin = this.GetParent().GetOrigin();
            this.particle = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_enigma/enigma_midnight_pulse.vpcf",
                ParticleAttachment.ABSORIGIN,
                this.GetParent()
            );
            this.caster = this.GetCaster() as CDOTA_BaseNPC;
            this.teamNumber = this.caster.GetTeamNumber();

            ParticleManager.SetParticleControl(this.particle, 0, this.GetParent().GetOrigin());
            ParticleManager.SetParticleControl(this.particle, 1, Vector(this.radius, 0, 0));

            this.AddParticle(this.particle, false, false, -1, false, false);

            GridNav.DestroyTreesAroundPoint(this.GetParent().GetOrigin(), this.radius, true);
            EmitSoundOn("Hero_Enigma.Midnight_Pulse", this.GetParent());

            this.StartIntervalThink(this.tick_rate);
        }
    }

    OnIntervalThink(): void {
        const enemies = FindUnitsInRadius(
            this.teamNumber,
            this.origin,
            undefined,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (const enemy of enemies) {
            if (!enemy.IsAncient() || enemy.IsCreepHero()) {
                ApplyDamage({
                    victim: enemy,
                    attacker: this.caster,
                    ability: this.ability,
                    damage: this.damage * enemy.GetMaxHealth() * this.tick_rate / 100,
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
