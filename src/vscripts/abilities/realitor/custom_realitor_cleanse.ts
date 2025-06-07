import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";

@registerAbility()
export class custom_realitor_cleanse extends BaseAbility {
    OnSpellStart(): void {
        this.EmitSound("Hero_Chen.HolyPersuasionCast");
        this.EmitSound("Hero_Chen.HolyPersuasionEnemy");

        const target = this.GetCursorTarget() as CDOTA_BaseNPC;
        const caster = this.GetCaster();

        const isEnemy = target.GetTeam() !== caster.GetTeam();
        const duration = this.GetSpecialValueFor("duration");

        if (target.TriggerSpellAbsorb(this)) {
            return;
        }

        if (target.IsRealHero() && caster.IsRealHero() &&
        PlayerResource.IsDisableHelpSetForPlayerID((target as CDOTA_BaseNPC_Hero).GetPlayerID(), (caster as CDOTA_BaseNPC_Hero).GetPlayerID())) {
            return;
        }

        target.Purge(isEnemy, !isEnemy, false, false, false);

        target.AddNewModifier(caster, this, "modifier_muted", { duration });
        target.AddNewModifier(caster, this, "modifier_disarmed", { duration });

        const particle = ParticleManager.CreateParticle("particles/units/heroes/hero_chen/chen_holy_persuasion.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, target);
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
}