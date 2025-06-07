import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";


@registerAbility()
export class custom_realitor_transcendance extends BaseAbility {
    IsRefreshable(): boolean {
        return false;
    }

    OnAbilityPhaseStart(): boolean {
        return true;
    }

    OnSpellStart(): void {
        EmitGlobalSound("realitor_transcendance");

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
                });
            }
        }
    }
}