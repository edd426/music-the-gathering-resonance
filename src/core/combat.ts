import type { Zone } from "../types/cards";
import type { DeployedMusician, GameState } from "../types/game";
import { getEffectiveVolume, applyDiscordantOnChordBreak } from "./chords";
import { opponentIndex, updatePlayer } from "./state";

export interface Attack {
  attackerIndex: number;
  targetIndex: number;
}

/** Check if a target zone is blocked by front-line defenders */
export function isZoneBlocked(
  targetZone: Zone,
  opponentStage: DeployedMusician[]
): boolean {
  if (targetZone === "front-row") return false;

  const hasInFront = (zone: Zone) =>
    opponentStage.some((m) => m.zone === zone);

  if (targetZone === "mid-stage") {
    return hasInFront("front-row");
  }

  // back-line: blocked if either front-row or mid-stage has defenders
  return hasInFront("front-row") || hasInFront("mid-stage");
}

/** Determine which zone indices are reachable given attacker's zone and range */
export function getValidTargets(
  _attackerZone: Zone,
  attackerRange: string,
  opponentStage: DeployedMusician[]
): number[] {
  const reachable: Zone[] = [];

  if (attackerRange === "melee") {
    // Can only hit front-row, or mid-stage if no front-row
    reachable.push("front-row");
    if (!opponentStage.some((m) => m.zone === "front-row")) {
      reachable.push("mid-stage");
    }
  } else if (attackerRange === "mid-reach") {
    reachable.push("front-row", "mid-stage");
    if (
      !opponentStage.some((m) => m.zone === "front-row") &&
      !opponentStage.some((m) => m.zone === "mid-stage")
    ) {
      reachable.push("back-line");
    }
  } else if (attackerRange === "sniper") {
    reachable.push("front-row", "mid-stage", "back-line");
  }

  return opponentStage
    .map((m, i) => ({ m, i }))
    .filter(
      ({ m }) =>
        reachable.includes(m.zone) && !isZoneBlocked(m.zone, opponentStage)
    )
    .map(({ i }) => i);
}

/** Resolve all strikes simultaneously: snapshot board, compute damage, apply at once */
export function resolveAllStrikes(
  state: GameState,
  attackerPlayerIndex: 0 | 1,
  attacks: Attack[]
): GameState {
  const defenderIdx = opponentIndex(attackerPlayerIndex);
  const attackerStage = state.players[attackerPlayerIndex].stage;
  const defenderStage = state.players[defenderIdx].stage;

  // Snapshot effective volumes before any damage
  const attackerVolumes = attackerStage.map((_, i) =>
    getEffectiveVolume(attackerStage, i)
  );
  const defenderVolumes = defenderStage.map((_, i) =>
    getEffectiveVolume(defenderStage, i)
  );

  // Accumulate damage for each musician
  const attackerDamage = new Map<number, number>();
  const defenderDamage = new Map<number, number>();

  let totalDamageDealt = 0;

  for (const { attackerIndex, targetIndex } of attacks) {
    const atkVol = attackerVolumes[attackerIndex];
    const defVol = defenderVolumes[targetIndex];

    // Attacker deals damage to defender
    defenderDamage.set(
      targetIndex,
      (defenderDamage.get(targetIndex) ?? 0) + atkVol
    );
    totalDamageDealt += atkVol;

    // Defender retaliates (mutual combat)
    attackerDamage.set(
      attackerIndex,
      (attackerDamage.get(attackerIndex) ?? 0) + defVol
    );
  }

  // Apply damage to attacker's stage
  const newAttackerStage = attackerStage.map((m, i) => {
    const dmg = attackerDamage.get(i) ?? 0;
    if (dmg === 0) return m;
    return { ...m, currentTone: m.currentTone - dmg };
  });

  // Apply damage to defender's stage
  const newDefenderStage = defenderStage.map((m, i) => {
    const dmg = defenderDamage.get(i) ?? 0;
    if (dmg === 0) return m;
    return { ...m, currentTone: m.currentTone - dmg };
  });

  // Find KO'd musicians (tone <= 0)
  const attackerKOs = newAttackerStage
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.currentTone <= 0);
  const defenderKOs = newDefenderStage
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.currentTone <= 0);

  const attackerDiscards = attackerKOs.map(({ m }) => m.card);
  const defenderDiscards = defenderKOs.map(({ m }) => m.card);

  // Apply Discordant on chord breaks before removing
  let newState = state;

  // Remove KO'd from stages
  const koAttackerIndices = new Set(attackerKOs.map(({ i }) => i));
  const koDefenderIndices = new Set(defenderKOs.map(({ i }) => i));

  // For discordant: check each KO'd musician
  for (const { i } of attackerKOs) {
    newState = applyDiscordantOnChordBreak(
      newState,
      attackerPlayerIndex,
      i
    );
  }
  for (const { i } of defenderKOs) {
    newState = applyDiscordantOnChordBreak(newState, defenderIdx, i);
  }

  // Now filter out KO'd musicians from the (potentially discordant-updated) stages
  const finalAttackerStage = newState.players[attackerPlayerIndex].stage
    .map((m, i) => {
      // Apply the damage we computed
      const dmg = attackerDamage.get(i) ?? 0;
      return dmg > 0 ? { ...m, currentTone: m.currentTone - dmg } : m;
    })
    .filter((_, i) => !koAttackerIndices.has(i));

  const finalDefenderStage = newState.players[defenderIdx].stage
    .map((m, i) => {
      const dmg = defenderDamage.get(i) ?? 0;
      return dmg > 0 ? { ...m, currentTone: m.currentTone - dmg } : m;
    })
    .filter((_, i) => !koDefenderIndices.has(i));

  newState = updatePlayer(newState, attackerPlayerIndex, {
    stage: finalAttackerStage,
    discard: [...newState.players[attackerPlayerIndex].discard, ...attackerDiscards],
  });

  newState = updatePlayer(newState, defenderIdx, {
    stage: finalDefenderStage,
    discard: [...newState.players[defenderIdx].discard, ...defenderDiscards],
  });

  // Track damage dealt for initiative calculation
  const newLastRoundDamage = [...newState.lastRoundDamage] as [number, number];
  newLastRoundDamage[attackerPlayerIndex] += totalDamageDealt;

  return { ...newState, lastRoundDamage: newLastRoundDamage };
}
