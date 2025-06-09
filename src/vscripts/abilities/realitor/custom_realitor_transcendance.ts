import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";


@registerAbility()
export class custom_realitor_transcendance extends BaseAbility {
    selfParticle: ParticleID | undefined;

    IsRefreshable(): boolean {
        return false;
    }

    OnAbilityPhaseInterrupted(): void {
        if (this.selfParticle && this.selfParticle !== -1) {
            ParticleManager.DestroyParticle(this.selfParticle, false);
            ParticleManager.ReleaseParticleIndex(this.selfParticle);
        }
    }

    OnAbilityPhaseStart(): boolean {
        this.selfParticle = this.CreateParticle("particles/econ/items/zeus/arcana_chariot/zeus_arcana_thundergods_wrath_atmoselec.vpcf", this.GetCaster(), false);
        return true;
    }

    CreateParticle(particleName: string, target: CDOTA_BaseNPC, release = true): ParticleID {
        const particle = ParticleManager.CreateParticle(particleName, ParticleAttachment.ABSORIGIN_FOLLOW, target);
        ParticleManager.SetParticleControlEnt(
            particle,
            1,
            target,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            "hitloc",
            target.GetAbsOrigin(),
            true
        );
        if (release) ParticleManager.ReleaseParticleIndex(particle);
        return particle;
    }

    OnSpellStart(): void {
        EmitGlobalSound("realitor_transcendance");

        if (this.selfParticle && this.selfParticle !== -1) {
            ParticleManager.ReleaseParticleIndex(this.selfParticle);
        }

        let enemies = FindUnitsInRadius(
            this.GetTeamNumber(),
            Vector(0, 0, 0),
            undefined,
            FIND_UNITS_EVERYWHERE,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        const casterHasShard = this.GetCaster().HasModifier("modifier_item_aghanims_shard");

        for (const enemy of enemies) {
            enemy.AddNewModifier(
                this.GetCaster(),
                this,
                "modifier_stunned",
                { duration: this.GetSpecialValueFor("stun_duration") }
            );

            const damage = this.GetSpecialValueFor("damage") * enemy.GetMaxHealth() / 100;

            ApplyDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: this,
                damage,
                damage_type: DamageTypes.PURE,
                damage_flags: DamageFlag.NONE
            });

            if (!casterHasShard) {
                Timers.CreateTimer(this.GetSpecialValueFor("restore_delay"), () => {
                    const heal = damage * this.GetSpecialValueFor("health_restored") / 100;
                    enemy.HealWithParams(heal, this, false, false, this.GetCaster(), false);

                    // Heal particles
                    this.CreateParticle("particles/units/heroes/hero_chen/chen_hand_of_god.vpcf", enemy);
                });
            }

            // Damage particles
            this.CreateParticle("particles/units/heroes/hero_chen/chen_hand_of_god_martyr_damage.vpcf", enemy);
        }
    }
}