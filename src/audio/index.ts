/** AudioSystem — public API, state diffing, controller attachment */

import type { GameState } from "../types/game";
import type { WinResult } from "../core/win";
import type { GameController } from "../game/controller";
import { createAudioEngine } from "./engine";
import type { AudioEngine } from "./engine";
import { createBoardMixer } from "./mixer";
import type { BoardMixer } from "./mixer";
import { createSFXPlayer } from "./sfx";
import type { SFXPlayer } from "./sfx";
import { detectChords } from "../core/chords";
import type { ChordGroup } from "../core/chords";

export class AudioSystem {
  private engine: AudioEngine | null = null;
  private mixer: BoardMixer | null = null;
  private sfx: SFXPlayer | null = null;
  private previousState: GameState | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.engine = createAudioEngine();
    await this.engine.resume();
    this.mixer = createBoardMixer(this.engine);
    this.sfx = createSFXPlayer(this.engine);
    this.initialized = true;
  }

  attachToController(controller: GameController): void {
    controller.onStateChange((state: GameState, winResult: WinResult | null) => {
      this.onStateChange(state, winResult);
    });
  }

  toggleMute(): boolean {
    if (!this.engine) return false;
    const newMuted = !this.engine.isMuted();
    this.engine.setMuted(newMuted);
    return newMuted;
  }

  isMuted(): boolean {
    return this.engine?.isMuted() ?? false;
  }

  private onStateChange(newState: GameState, winResult: WinResult | null): void {
    if (!this.sfx || !this.mixer) return;
    const prev = this.previousState;

    if (prev) {
      this.diffAndPlaySFX(prev, newState, winResult);
    }

    // Update continuous mix
    this.mixer.updateFromState(newState);

    // Store for next diff
    this.previousState = newState;
  }

  private diffAndPlaySFX(
    prev: GameState,
    next: GameState,
    winResult: WinResult | null
  ): void {
    const sfx = this.sfx!;

    // Check win/loss first
    if (winResult) {
      // Player 0 perspective — could be either
      sfx.playWin();
      return;
    }

    // Phase changes
    if (prev.currentPhase !== next.currentPhase) {
      sfx.playPhaseTransition();
    }

    // Check each player for deploys, KOs, damage, harmony
    for (const pIdx of [0, 1] as const) {
      const prevPlayer = prev.players[pIdx];
      const nextPlayer = next.players[pIdx];

      // Deploys: stage grew
      if (nextPlayer.stage.length > prevPlayer.stage.length) {
        const newCount = nextPlayer.stage.length - prevPlayer.stage.length;
        for (let i = 0; i < newCount; i++) {
          const deployed = nextPlayer.stage[prevPlayer.stage.length + i];
          if (deployed) {
            sfx.playDeploy(deployed.card.faction);
          }
        }
      }

      // KOs: stage shrank
      if (nextPlayer.stage.length < prevPlayer.stage.length) {
        const koCount = prevPlayer.stage.length - nextPlayer.stage.length;
        for (let i = 0; i < koCount; i++) {
          sfx.playKO();
        }
      }

      // Combat damage: tone decreased on surviving musicians
      const minLen = Math.min(prevPlayer.stage.length, nextPlayer.stage.length);
      for (let i = 0; i < minLen; i++) {
        if (nextPlayer.stage[i].currentTone < prevPlayer.stage[i].currentTone) {
          sfx.playCombatHit();
          break; // One hit SFX per player per state change
        }
      }

      // Harmony drain
      if (nextPlayer.harmony < prevPlayer.harmony) {
        sfx.playResonanceDrain();
      }

      // Chord formation
      const prevChords = detectChords(prevPlayer.stage);
      const nextChords = detectChords(nextPlayer.stage);
      const newChords = findNewChords(prevChords, nextChords);
      for (const chord of newChords) {
        sfx.playChordFormation(chord.type);
      }
    }
  }

  dispose(): void {
    this.mixer?.dispose();
    this.engine?.dispose();
    this.engine = null;
    this.mixer = null;
    this.sfx = null;
    this.previousState = null;
    this.initialized = false;
  }
}

/** Find chords in `next` that weren't in `prev` */
function findNewChords(
  prev: ChordGroup[],
  next: ChordGroup[]
): ChordGroup[] {
  return next.filter((nc) => {
    return !prev.some(
      (pc) => pc.faction === nc.faction && pc.type === nc.type
    );
  });
}
