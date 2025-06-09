import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";
import { modifier_slowed } from "../../modifiers/modifier_slowed";


@registerAbility()
export class custom_realitor_sealed_fate extends BaseAbility {
    GetAOERadius(): number {
        return this.GetSpecialValueFor("radius");
    }

    private CreateFollowParticle(target: CDOTA_BaseNPC, duration: number): void {
        const particle = ParticleManager.CreateParticle("particles/units/heroes/hero_chen/chen_penitence.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, target);
        ParticleManager.SetParticleControlEnt(
            particle,
            0,
            target,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            "attach_hitloc",
            target.GetAbsOrigin(),
            true
        );
        ParticleManager.ReleaseParticleIndex(particle);
    }

    private DealDamage(target: CDOTA_BaseNPC): void {
        ApplyDamage({
            victim: target,
            attacker: this.GetCaster(),
            ability: this,
            damage: this.GetSpecialValueFor("damage"),
            damage_type: DamageTypes.MAGICAL,
            damage_flags: DamageFlag.NONE
        });
    }

    OnSpellStart(): void {
        this.EmitSound("Hero_Chen.PenitenceCast");

        const caster = this.GetCaster();
        const origin = this.GetCursorPosition();

        const slowDuration = this.GetSpecialValueFor("slow_duration");
        const silenceDuration = this.GetSpecialValueFor("silence_duration");
        const healthThreshold = this.GetSpecialValueFor("health_threshold") / 100;

        const enemies = FindUnitsInRadius(
            caster.GetTeamNumber(),
            origin,
            undefined,
            this.GetSpecialValueFor("radius"),
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (const enemy of enemies) {
            EmitSoundOn("Hero_Chen.PenitenceImpact", enemy);
            // Silence particle
            this.CreateFollowParticle(enemy, silenceDuration);

            if (enemy.IsRealHero()) {
                enemy.AddNewModifier(caster, this, "modifier_silence", { duration: silenceDuration });

                Timers.CreateTimer(silenceDuration, () => {
                    // After silence ends, check HP and maybe slow
                    if ((enemy.GetHealth() / enemy.GetMaxHealth()) > healthThreshold) {
                        enemy.AddNewModifier(caster, this, modifier_slowed.name, {
                            duration: slowDuration,
                            bonus_movement_speed: this.GetSpecialValueFor("bonus_movement_speed")
                        });

                        // Slow particle
                        this.CreateFollowParticle(enemy, slowDuration);
                    }

                    this.DealDamage(enemy);
                });
            } else {
                // Non-hero units take instant damage
                this.DealDamage(enemy);
            }
        }
    }
}
