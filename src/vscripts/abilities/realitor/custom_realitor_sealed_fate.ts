import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";
import { modifier_slowed } from "../../modifiers/modifier_slowed";


@registerAbility()
export class custom_realitor_sealed_fate extends BaseAbility {
    sound_cast: string = "Hero_Chen.PenitenceCast";
    particle_cast: string = "particles/units/heroes/hero_chen/chen_penitence.vpcf";

    GetAOERadius(): number {
        return this.GetSpecialValueFor("radius");
    }

    private CreateFollowParticle(target: CDOTA_BaseNPC, duration: number): void {
        const particle = ParticleManager.CreateParticle(this.particle_cast, ParticleAttachment.ABSORIGIN_FOLLOW, target);
        ParticleManager.SetParticleControlEnt(
            particle,
            0,
            target,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            "attach_hitloc",
            target.GetAbsOrigin(),
            true
        );
        Timers.CreateTimer(duration, () => {
            ParticleManager.DestroyParticle(particle, false);
            ParticleManager.ReleaseParticleIndex(particle);
        });
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
        this.EmitSound(this.sound_cast);

        const caster = this.GetCaster();
        const origin = this.GetCursorPosition();

        const radius = this.GetSpecialValueFor("radius");
        const slowDuration = this.GetSpecialValueFor("slow_duration");
        const silenceDuration = this.GetSpecialValueFor("silence_duration");
        const moveSpeedBonus = this.GetSpecialValueFor("bonus_movement_speed");
        const healthThreshold = this.GetSpecialValueFor("health_threshold") / 100;

        const enemies = FindUnitsInRadius(
            caster.GetTeamNumber(),
            origin,
            undefined,
            radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (const enemy of enemies) {
            // Silence particle
            this.CreateFollowParticle(enemy, silenceDuration);

            if (enemy.IsRealHero()) {
                enemy.AddNewModifier(caster, this, "modifier_silence", { duration: silenceDuration });

                Timers.CreateTimer(silenceDuration, () => {
                    // After silence ends, check HP and maybe slow
                    if ((enemy.GetHealth() / enemy.GetMaxHealth()) > healthThreshold) {
                        enemy.AddNewModifier(caster, this, modifier_slowed.name, {
                            duration: slowDuration,
                            bonus_movement_speed: moveSpeedBonus
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
