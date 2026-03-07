/** Maps board state to active stems, gain, and degradation */

import type { Faction, Zone } from "../types/cards";
import type { GameState, DeployedMusician } from "../types/game";
import type { AudioEngine } from "./engine";
import type { StemPlayer } from "./stems";
import { createStemPlayer } from "./stems";
import { detectChords } from "../core/chords";

/** Zone mix parameters */
const ZONE_MIX: Record<Zone, { gain: number; reverb: number }> = {
  "front-row": { gain: 0.8, reverb: 0.1 },
  "mid-stage": { gain: 0.6, reverb: 0.3 },
  "back-line": { gain: 0.35, reverb: 0.6 },
};

/** Harmony degradation tiers */
function getDegradation(harmony: number): {
  cutoff: number;
  detuneCents: number;
} {
  if (harmony >= 16) return { cutoff: 20000, detuneCents: 0 };
  if (harmony >= 11) return { cutoff: 8000, detuneCents: 5 };
  if (harmony >= 6) return { cutoff: 4000, detuneCents: 20 };
  if (harmony >= 3) return { cutoff: 2000, detuneCents: 50 };
  if (harmony >= 1) return { cutoff: 1000, detuneCents: 100 };
  return { cutoff: 200, detuneCents: 200 };
}

/** Get the "best" zone for a faction (front > mid > back) */
function bestZoneForFaction(
  stage: DeployedMusician[],
  faction: Faction
): Zone | null {
  const zones: Zone[] = ["front-row", "mid-stage", "back-line"];
  for (const zone of zones) {
    if (stage.some((m) => m.card.faction === faction && m.zone === zone)) {
      return zone;
    }
  }
  return null;
}

export interface BoardMixer {
  updateFromState(state: GameState): void;
  dispose(): void;
}

export function createBoardMixer(engine: AudioEngine): BoardMixer {
  // Track stems per player per faction
  const playerStems: [Map<Faction, StemPlayer>, Map<Faction, StemPlayer>] = [
    new Map(),
    new Map(),
  ];

  function getOrCreateStem(
    playerIndex: 0 | 1,
    faction: Faction
  ): StemPlayer {
    const stems = playerStems[playerIndex];
    let stem = stems.get(faction);
    if (!stem) {
      stem = createStemPlayer(faction, engine);
      stems.set(faction, stem);
    }
    return stem;
  }

  function updatePlayerStems(
    playerIndex: 0 | 1,
    stage: DeployedMusician[],
    harmony: number
  ): void {
    const stems = playerStems[playerIndex];

    // Find active factions
    const activeFactions = new Set<Faction>();
    for (const m of stage) {
      if (m.currentTone > 0) {
        activeFactions.add(m.card.faction);
      }
    }

    // Stop stems for factions no longer on stage
    for (const [faction, stem] of stems) {
      if (!activeFactions.has(faction)) {
        stem.stop();
        stems.delete(faction);
      }
    }

    // Detect chords for bonus
    const chords = detectChords(stage);

    // Update/create stems for active factions
    for (const faction of activeFactions) {
      const stem = getOrCreateStem(playerIndex, faction);
      if (!stem.isPlaying()) {
        stem.start();
      }

      // Zone-based mix
      const zone = bestZoneForFaction(stage, faction);
      if (!zone) continue;
      const zoneMix = ZONE_MIX[zone];

      // Count musicians of this faction for gain boost
      const count = stage.filter(
        (m) => m.card.faction === faction && m.currentTone > 0
      ).length;
      const countBonus = Math.min((count - 1) * 0.1, 0.4);

      // Chord bonus
      let chordBonus = 0;
      for (const chord of chords) {
        if (chord.faction === faction) {
          chordBonus = chord.type === "power" ? 0.3 : 0.15;
        }
      }

      // Discordant check
      const hasDiscordant = stage.some(
        (m) =>
          m.card.faction === faction && m.discordantTurnsRemaining > 0
      );

      // Harmony degradation
      const deg = getDegradation(harmony);

      // Apply parameters
      const baseGain = zoneMix.gain + countBonus + chordBonus;
      stem.setGain(Math.min(baseGain, 1.0));
      stem.setReverbSend(
        hasDiscordant ? 0.8 : zoneMix.reverb
      );
      stem.setFilterCutoff(deg.cutoff);

      if (hasDiscordant) {
        stem.setDetune(30);
      }
    }
  }

  return {
    updateFromState(state: GameState): void {
      for (const pIdx of [0, 1] as const) {
        const player = state.players[pIdx];
        updatePlayerStems(pIdx, player.stage, player.harmony);
      }
    },

    dispose(): void {
      for (const stems of playerStems) {
        for (const stem of stems.values()) {
          stem.stop();
        }
        stems.clear();
      }
    },
  };
}
