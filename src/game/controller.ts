import type { Card } from "../types/cards";
import type { GameState } from "../types/game";
import { GAME_CONFIG } from "../types/game";
import {
  createInitialGameState,
  getActivePlayer,
  advancePhase,
  playSoundcheck,
  deployMusician,
  playSongCard,
  attachRiffCard,
  applyVenueCard,
  resolveAllStrikes,
  checkWinCondition,
  discardToHandLimit,
  getAvailableResources,
  getValidTargets,
  updateMusician,
} from "../core";
import type { WinResult } from "../core";
import type { InitOptions } from "../core/state";
import type { GameAction } from "./actions";
import { GameLog } from "./log";

export type StateChangeCallback = (state: GameState, win: WinResult | null) => void;

export class GameController {
  private state!: GameState;
  private log = new GameLog();
  private listeners: StateChangeCallback[] = [];
  private winResult: WinResult | null = null;

  constructor(
    private p1Name: string,
    private p1Deck: Card[],
    private p2Name: string,
    private p2Deck: Card[],
    private rng?: () => number,
    private options?: InitOptions
  ) {}

  start(): void {
    this.state = createInitialGameState(
      this.p1Name,
      this.p1Deck,
      this.p2Name,
      this.p2Deck,
      this.rng,
      this.options
    );
    this.log.clear();
    this.winResult = null;

    const first = getActivePlayer(this.state).name;
    this.log.add(0, "System", `Game started! ${first} goes first.`);

    // Auto-advance through refresh and draw for the first turn
    this.autoAdvance();
    this.notify();
  }

  getState(): GameState {
    return this.state;
  }

  getLog(): readonly { turn: number; player: string; message: string }[] {
    return this.log.getAll();
  }

  getWinResult(): WinResult | null {
    return this.winResult;
  }

  onStateChange(cb: StateChangeCallback): void {
    this.listeners.push(cb);
  }

  dispatch(action: GameAction): void {
    if (this.winResult) return;

    const player = getActivePlayer(this.state);
    const pIdx = this.state.activePlayerIndex;
    const turn = this.state.turnNumber;

    switch (action.type) {
      case "START_GAME":
        this.start();
        return;

      case "PLAY_SOUNDCHECK": {
        if (this.state.currentPhase !== "soundcheck") return;
        const card = player.hand[action.handIndex];
        if (!card) return;
        this.state = playSoundcheck(this.state, pIdx, action.handIndex);
        this.log.add(turn, player.name, `Played ${card.name} as Soundcheck resource.`);
        break;
      }

      case "DEPLOY": {
        if (this.state.currentPhase !== "deploy") return;
        const card = player.hand[action.handIndex];
        if (!card || card.type !== "musician") return;
        if (getAvailableResources(player) < card.cost) return;
        this.state = deployMusician(this.state, pIdx, action.handIndex, action.zone);
        this.log.add(turn, player.name, `Deployed ${card.name} to ${action.zone}.`);
        break;
      }

      case "PLAY_SONG": {
        if (this.state.currentPhase !== "equip-song") return;
        const card = player.hand[action.handIndex];
        if (!card || card.type !== "song") return;
        if (getAvailableResources(player) < card.cost) return;
        this.state = playSongCard(this.state, pIdx, action.handIndex, action.targets);
        this.log.add(turn, player.name, `Played ${card.name}!`);
        this.checkForKOs();
        break;
      }

      case "ATTACH_RIFF": {
        if (this.state.currentPhase !== "equip-song") return;
        const card = player.hand[action.handIndex];
        if (!card || card.type !== "riff") return;
        if (getAvailableResources(player) < card.cost) return;
        const targetMusician = player.stage[action.targetMusicianIndex];
        this.state = attachRiffCard(this.state, pIdx, action.handIndex, action.targetMusicianIndex);
        // Apply riff stat bonuses
        this.applyRiffBonus(pIdx, action.targetMusicianIndex, card.effect);
        this.log.add(
          turn, player.name,
          `Attached ${card.name} to ${targetMusician.card.name}.`
        );
        break;
      }

      case "PLAY_VENUE": {
        if (this.state.currentPhase !== "equip-song") return;
        const card = player.hand[action.handIndex];
        if (!card || card.type !== "venue") return;
        if (getAvailableResources(player) < card.cost) return;
        this.state = applyVenueCard(this.state, pIdx, action.handIndex);
        this.log.add(turn, player.name, `Played venue: ${card.name}.`);
        break;
      }

      case "DECLARE_ATTACKS": {
        if (this.state.currentPhase !== "strike") return;
        if (action.attacks.length === 0) break;

        // Enforce back-line restriction
        const validAttacks = action.attacks.filter((a) => {
          const attacker = player.stage[a.attackerIndex];
          return attacker && attacker.zone !== "back-line";
        });

        if (validAttacks.length > 0) {
          // Log each attack
          const oppStage = this.state.players[pIdx === 0 ? 1 : 0].stage;
          for (const atk of validAttacks) {
            const attacker = player.stage[atk.attackerIndex];
            const target = oppStage[atk.targetIndex];
            if (attacker && target) {
              this.log.add(
                turn, player.name,
                `${attacker.card.name} strikes ${target.card.name}!`
              );
            }
          }
          this.state = resolveAllStrikes(this.state, pIdx, validAttacks);
          this.checkForKOs();

          // Auto-advance past strike phase to prevent double attacks
          this.state = advancePhase(this.state);
          this.autoAdvance();
        }
        break;
      }

      case "DISCARD_CARDS": {
        if (this.state.currentPhase !== "discard") return;
        const excess = player.hand.length - GAME_CONFIG.HAND_LIMIT;
        if (excess <= 0) break;
        this.state = discardToHandLimit(this.state, pIdx, action.indices);
        this.log.add(turn, player.name, `Discarded ${action.indices.length} card(s).`);
        break;
      }

      case "ADVANCE_PHASE": {
        this.state = advancePhase(this.state);
        this.autoAdvance();
        break;
      }
    }

    // Check win after every action
    this.winResult = checkWinCondition(this.state);
    if (this.winResult) {
      const winner = this.state.players[this.winResult.winner].name;
      const cond = this.winResult.condition === "silence" ? "Silence" : "Clear the Stage";
      this.log.add(turn, "System", `${winner} wins by ${cond}!`);
    }

    this.notify();
  }

  /** Get valid attack targets for a given attacker */
  getValidTargetsForAttacker(attackerIndex: number): number[] {
    const pIdx = this.state.activePlayerIndex;
    const player = this.state.players[pIdx];
    const attacker = player.stage[attackerIndex];
    if (!attacker || attacker.zone === "back-line") return [];
    const oppIdx = pIdx === 0 ? 1 : 0;
    const oppStage = this.state.players[oppIdx].stage;
    return getValidTargets(attacker.zone, attacker.card.range, oppStage);
  }

  private applyRiffBonus(playerIndex: 0 | 1, musicianIndex: number, effect: string): void {
    const musician = this.state.players[playerIndex].stage[musicianIndex];
    if (!musician) return;

    switch (effect) {
      case "whammy-bar": {
        const newCard = { ...musician.card, volume: musician.card.volume + 1 };
        this.state = updateMusician(this.state, playerIndex, musicianIndex, { card: newCard });
        break;
      }
      case "feedback-loop": {
        const newCard = { ...musician.card, resonance: musician.card.resonance + 1 };
        this.state = updateMusician(this.state, playerIndex, musicianIndex, { card: newCard });
        break;
      }
      case "power-amp": {
        const newCard = { ...musician.card, volume: musician.card.volume + 2 };
        this.state = updateMusician(this.state, playerIndex, musicianIndex, { card: newCard });
        break;
      }
    }
  }

  private checkForKOs(): void {
    for (const pIdx of [0, 1] as const) {
      const player = this.state.players[pIdx];
      const kos = player.stage.filter((m) => m.currentTone <= 0);
      for (const ko of kos) {
        this.log.add(
          this.state.turnNumber,
          "System",
          `${ko.card.name} is KO'd!`
        );
      }
    }
  }

  /** Auto-advance through phases that need no player input */
  private autoAdvance(): void {
    const autoPhases = new Set(["refresh", "draw", "resonance"]);
    while (autoPhases.has(this.state.currentPhase)) {
      const phase = this.state.currentPhase;
      if (phase === "resonance") {
        this.logResonance();
      }
      if (phase === "draw" && this.state.turnNumber > 1) {
        this.log.add(
          this.state.turnNumber,
          getActivePlayer(this.state).name,
          "Drew 2 cards."
        );
      }
      this.state = advancePhase(this.state);

      // Check win after resonance
      this.winResult = checkWinCondition(this.state);
      if (this.winResult) return;
    }

    // Auto-skip strike phase on turn 1
    if (this.state.currentPhase === "strike" && this.state.turnNumber === 1) {
      this.log.add(
        this.state.turnNumber,
        "System",
        "No attacks on turn 1 — build your board first!"
      );
      this.state = advancePhase(this.state);
      this.autoAdvance();
      return;
    }

    // Auto-skip discard if hand is within limit
    if (this.state.currentPhase === "discard") {
      const player = getActivePlayer(this.state);
      if (player.hand.length <= GAME_CONFIG.HAND_LIMIT) {
        this.state = advancePhase(this.state);
        // After discard we end turn / start new turn — auto-advance the new turn too
        this.autoAdvance();
      }
    }
  }

  private logResonance(): void {
    const player = getActivePlayer(this.state);
    const backLine = player.stage.filter((m) => m.zone === "back-line");
    if (backLine.length > 0) {
      const totalRes = backLine.reduce((sum, m) => {
        if (m.discordantTurnsRemaining > 0) return sum;
        return sum + m.card.resonance;
      }, 0);
      if (totalRes > 0) {
        this.log.add(
          this.state.turnNumber,
          player.name,
          `Back Line resonance drains ${totalRes} Harmony from opponent!`
        );
      }
    }
  }

  private notify(): void {
    for (const cb of this.listeners) {
      cb(this.state, this.winResult);
    }
  }
}
