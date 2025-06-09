import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";

@registerAbility()
export class custom_realitor_cleanse extends BaseAbility {
    OnAbilityPhaseStart(): boolean {
        const target = this.GetCursorTarget() as CDOTA_BaseNPC;
        const caster = this.GetCaster();

        return !(target.IsRealHero() && caster.IsRealHero() &&
            PlayerResource.IsDisableHelpSetForPlayerID((target as CDOTA_BaseNPC_Hero).GetPlayerID(), (caster as CDOTA_BaseNPC_Hero).GetPlayerID()));
    }

    OnSpellStart(): void {
        const target = this.GetCursorTarget() as CDOTA_BaseNPC;
        const caster = this.GetCaster();

        const isEnemy = target.GetTeam() !== caster.GetTeam();
        const duration = this.GetSpecialValueFor("duration");

        if (target.TriggerSpellAbsorb(this)) {
            return;
        }
        
        if(!target.IsDebuffImmune()) {
            target.Purge(isEnemy, !isEnemy, false, false, false);
            target.AddNewModifier(caster, this, "modifier_muted", { duration });
            target.AddNewModifier(caster, this, "modifier_disarmed", { duration });
        }

        this.EmitSound("Hero_Chen.HolyPersuasionCast");
        EmitSoundOn("Hero_Chen.HolyPersuasionEnemy", target);

        const particle = ParticleManager.CreateParticle("particles/units/heroes/hero_chen/chen_holy_persuasion.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, target);
        ParticleManager.SetParticleControlEnt(
            particle,
            1,
            target,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            "hitloc",
            target.GetAbsOrigin(),
            true
        );
        ParticleManager.ReleaseParticleIndex(particle);
    }
}