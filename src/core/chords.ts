import type { Faction, Zone } from "../types/cards";
import type { DeployedMusician, GameState } from "../types/game";
import { updatePlayer } from "./state";

/** Zone adjacency: front-row <-> mid-stage <-> back-line */
const ZONE_ORDER: Zone[] = ["front-row", "mid-stage", "back-line"];

function zoneIndex(zone: Zone): number {
  return ZONE_ORDER.indexOf(zone);
}

function zonesAdjacent(a: Zone, b: Zone): boolean {
  return Math.abs(zoneIndex(a) - zoneIndex(b)) === 1;
}

export interface ChordGroup {
  faction: Faction;
  members: number[]; // indices into stage array
  type: "minor" | "power";
}

/** Detect chords (same-faction groupings) on a player's stage */
export function detectChords(stage: DeployedMusician[]): ChordGroup[] {
  const byFaction = new Map<Faction, number[]>();

  for (let i = 0; i < stage.length; i++) {
    const faction = stage[i].card.faction;
    const existing = byFaction.get(faction) ?? [];
    existing.push(i);
    byFaction.set(faction, existing);
  }

  const chords: ChordGroup[] = [];

  for (const [faction, members] of byFaction) {
    if (members.length >= 3) {
      // Power Chord: 3+ members in all zones (must occupy all 3 zones)
      const zones = new Set(members.map((i) => stage[i].zone));
      if (zones.size === 3) {
        chords.push({ faction, members, type: "power" });
      }
    } else if (members.length === 2) {
      // Minor Chord: 2 members in adjacent zones
      const [a, b] = members;
      if (zonesAdjacent(stage[a].zone, stage[b].zone)) {
        chords.push({ faction, members, type: "minor" });
      }
    }
  }

  return chords;
}

/** Compute stat bonuses from chords */
export function computeChordBonuses(
  stage: DeployedMusician[]
): Map<number, { volume: number; resonance: number }> {
  const bonuses = new Map<number, { volume: number; resonance: number }>();
  const chords = detectChords(stage);

  for (const chord of chords) {
    for (const memberIdx of chord.members) {
      const existing = bonuses.get(memberIdx) ?? {
        volume: 0,
        resonance: 0,
      };
      if (chord.type === "minor") {
        existing.volume += 1;
        existing.resonance += 1;
      } else {
        existing.volume += 2;
        existing.resonance += 2; // double resonance = base doubled via chord bonus
      }
      bonuses.set(memberIdx, existing);
    }
  }

  return bonuses;
}

/** Check if a musician qualifies for Ensemble Bonus:
 *  Must be in mid-stage AND have same-faction allies in both front-row and back-line */
export function computeEnsembleBonus(
  stage: DeployedMusician[],
  musicianIndex: number
): { volume: number; tone: number } {
  const musician = stage[musicianIndex];
  if (musician.zone !== "mid-stage") {
    return { volume: 0, tone: 0 };
  }

  const faction = musician.card.faction;
  const hasFrontAlly = stage.some(
    (m, i) =>
      i !== musicianIndex &&
      m.card.faction === faction &&
      m.zone === "front-row"
  );
  const hasBackAlly = stage.some(
    (m, i) =>
      i !== musicianIndex &&
      m.card.faction === faction &&
      m.zone === "back-line"
  );

  if (hasFrontAlly && hasBackAlly) {
    return { volume: 1, tone: 1 };
  }
  return { volume: 0, tone: 0 };
}

/** Get effective Volume for a musician, including chord + ensemble + riff bonuses */
export function getEffectiveVolume(
  stage: DeployedMusician[],
  musicianIndex: number
): number {
  const musician = stage[musicianIndex];
  const chordBonuses = computeChordBonuses(stage);
  const chord = chordBonuses.get(musicianIndex);
  const ensemble = computeEnsembleBonus(stage, musicianIndex);

  let volume = musician.card.volume;
  volume += chord?.volume ?? 0;
  volume += ensemble.volume;

  // Riff bonuses (simple: count riffs that boost volume — for now riffs have no stat mods)
  return volume;
}

/** Get effective Resonance for a musician (discordant = 0) */
export function getEffectiveResonance(
  stage: DeployedMusician[],
  musicianIndex: number
): number {
  const musician = stage[musicianIndex];
  if (musician.discordantTurnsRemaining > 0) {
    return 0;
  }

  const chordBonuses = computeChordBonuses(stage);
  const chord = chordBonuses.get(musicianIndex);

  return musician.card.resonance + (chord?.resonance ?? 0);
}

/** When a chord member is removed, remaining members become Discordant */
export function applyDiscordantOnChordBreak(
  state: GameState,
  playerIndex: 0 | 1,
  removedIndex: number
): GameState {
  const player = state.players[playerIndex];
  const removedMusician = player.stage[removedIndex];
  if (!removedMusician) return state;

  const faction = removedMusician.card.faction;

  // Check if the removed musician was part of a chord before removal
  const chordsBefore = detectChords(player.stage);
  const wasInChord = chordsBefore.some(
    (c) => c.faction === faction && c.members.includes(removedIndex)
  );

  if (!wasInChord) return state;

  // After removal, check if remaining same-faction members still form a chord
  const stageAfter = player.stage.filter((_, i) => i !== removedIndex);
  const chordsAfter = detectChords(stageAfter);
  const stillHasChord = chordsAfter.some((c) => c.faction === faction);

  if (stillHasChord) return state;

  // Mark remaining same-faction members as Discordant (1 turn)
  const newStage = player.stage.map((m, i) => {
    if (i !== removedIndex && m.card.faction === faction) {
      return { ...m, discordantTurnsRemaining: 1 };
    }
    return m;
  });

  return updatePlayer(state, playerIndex, { stage: newStage });
}
