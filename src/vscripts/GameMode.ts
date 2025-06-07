import { reloadable } from "./lib/tstl-utils";

const GOODGUYS_MAX_PLAYERS = 5;
const BADGUYS_MAX_PLAYERS = 5;
const MAX_PLAYERS = GOODGUYS_MAX_PLAYERS + BADGUYS_MAX_PLAYERS;

const courierMap: Map<number, boolean> = new Map();

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("soundfile", "soundevents/custom_sounds.vsndevts", context);
    }

    public static Activate(this: void) {
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.configure();

        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, GOODGUYS_MAX_PLAYERS);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, BADGUYS_MAX_PLAYERS);

        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(20);
        GameRules.SetTimeOfDay(0.25);
        GameRules.GetGameModeEntity().SetUseDefaultDOTARuneSpawnLogic(true);
        GameRules.SetNextBountyRuneSpawnTime(4);
    }

    private StartGame(): void {
        print("Game starting!");
    }

    public Reload() {
        print("Script reloaded!");
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        if (state === GameState.CUSTOM_GAME_SETUP) {
            if (IsInToolsMode()) {
                Timers.CreateTimer(0.2, () => GameRules.FinishCustomGameSetup());
            }
        }

        if (state === GameState.STRATEGY_TIME) {
            for (let playerID = 0; playerID < MAX_PLAYERS; playerID++) {
                if (PlayerResource.IsValidPlayerID(playerID) && !PlayerResource.HasSelectedHero(playerID)) {
                    const player = PlayerResource.GetPlayer(playerID);
                    player?.MakeRandomHeroSelection();
                }
            }
        }

        if (state === GameState.PRE_GAME) {
            Timers.CreateTimer(0.2, () => this.StartGame());
        }
    }

    public OnNpcSpawned(event: NpcSpawnedEvent) {
        const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC;
        const playerID = unit.GetPlayerOwnerID();
        if (unit.IsRealHero()) {
            if(!courierMap.get(playerID)) {
                Timers.CreateTimer(0.2, () => {
                    PlayerResource.GetPlayer(playerID)?.SpawnCourierAtPosition(unit.GetAbsOrigin());
                });
                courierMap.set(playerID, true);
            }
        }
    }
}
