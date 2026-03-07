import type { GameState } from "../types/game";
import type { Card, MusicianCard, Zone } from "../types/cards";
import type { GameAction } from "../game/actions";
import { getAvailableResources, getValidTargets } from "../core";

/**
 * AI Strategy — pure functions. No side effects, no delays.
 * Takes GameState + playerIndex, returns the next GameAction.
 */
export function getAIAction(state: GameState, playerIndex: 0 | 1): GameAction {
  switch (state.currentPhase) {
    case "soundcheck":
      return getSoundcheckAction(state, playerIndex);
    case "deploy":
      return getDeployAction(state, playerIndex);
    case "equip-song":
      return getEquipSongAction(state, playerIndex);
    case "strike":
      return getStrikeAction(state, playerIndex);
    case "discard":
      return getDiscardAction(state, playerIndex);
    default:
      return { type: "ADVANCE_PHASE" };
  }
}

function getSoundcheckAction(state: GameState, playerIndex: 0 | 1): GameAction {
  const player = state.players[playerIndex];

  // If already played soundcheck this turn, advance
  if (state.soundcheckPlayedThisTurn) {
    return { type: "ADVANCE_PHASE" };
  }

  // If hand <= 3 cards, skip to preserve options
  if (player.hand.length <= 3) {
    return { type: "ADVANCE_PHASE" };
  }

  // Play the lowest-value card as resource, preferring non-musicians
  let bestIndex = -1;
  let bestScore = Infinity;
  for (let i = 0; i < player.hand.length; i++) {
    const card = player.hand[i];
    // Non-musicians are worth less as cards (prefer sacrificing them)
    const typePenalty = card.type === "musician" ? 10 : 0;
    const score = card.cost + typePenalty;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex >= 0) {
    return { type: "PLAY_SOUNDCHECK", handIndex: bestIndex };
  }

  return { type: "ADVANCE_PHASE" };
}

function getDeployAction(state: GameState, playerIndex: 0 | 1): GameAction {
  const player = state.players[playerIndex];
  const resources = getAvailableResources(player);

  if (state.deploysRemaining <= 0) {
    return { type: "ADVANCE_PHASE" };
  }

  // Find affordable musicians in hand
  const affordable: { card: MusicianCard; index: number }[] = [];
  for (let i = 0; i < player.hand.length; i++) {
    const card = player.hand[i];
    if (card.type === "musician" && card.cost <= resources) {
      affordable.push({ card, index: i });
    }
  }

  if (affordable.length === 0) {
    return { type: "ADVANCE_PHASE" };
  }

  // Pick best value musician (volume + tone)
  affordable.sort((a, b) => (b.card.volume + b.card.tone) - (a.card.volume + a.card.tone));
  const chosen = affordable[0];

  // Zone priority
  const zone = pickZone(player.stage, chosen.card);

  return { type: "DEPLOY", handIndex: chosen.index, zone };
}

function pickZone(
  stage: GameState["players"][0]["stage"],
  card: MusicianCard
): Zone {
  const hasFrontRow = stage.some((m) => m.zone === "front-row");
  const hasMidStage = stage.some((m) => m.zone === "mid-stage");
  const hasBackLine = stage.some((m) => m.zone === "back-line");

  // Check for chord potential (adjacent same-faction)
  const factionInFront = stage.some((m) => m.zone === "front-row" && m.card.faction === card.faction);
  const factionInMid = stage.some((m) => m.zone === "mid-stage" && m.card.faction === card.faction);
  const factionInBack = stage.some((m) => m.zone === "back-line" && m.card.faction === card.faction);

  // 1. Front-row if empty (need defenders)
  if (!hasFrontRow) return "front-row";

  // 2. Adjacent zone to same-faction for Minor Chord
  if (factionInFront && !hasMidStage) return "mid-stage";
  if (factionInMid && !hasFrontRow) return "front-row";
  if (factionInMid && !hasBackLine) return "back-line";

  // 3. Third zone for Power Chord completion
  if (factionInFront && factionInMid && !hasBackLine) return "back-line";
  if (factionInFront && factionInBack && !hasMidStage) return "mid-stage";
  if (factionInMid && factionInBack && !hasFrontRow) return "front-row";

  // 4. High-resonance musicians go to back-line
  if (card.resonance >= 2 && !hasBackLine) return "back-line";

  // 5. Mid-stage otherwise, or wherever there's room
  if (!hasMidStage) return "mid-stage";
  if (!hasBackLine) return "back-line";

  // All zones occupied, just stack on front-row
  return "front-row";
}

function getEquipSongAction(state: GameState, playerIndex: 0 | 1): GameAction {
  const player = state.players[playerIndex];
  const oppIdx = playerIndex === 0 ? 1 : 0;
  const opponent = state.players[oppIdx];
  const resources = getAvailableResources(player);

  for (let i = 0; i < player.hand.length; i++) {
    const card = player.hand[i];
    if (card.cost > resources) continue;

    if (card.type === "song") {
      const action = getSongAction(card, i, player, opponent);
      if (action) return action;
    }

    if (card.type === "riff") {
      const action = getRiffAction(card, i, player);
      if (action) return action;
    }

    if (card.type === "venue") {
      return { type: "PLAY_VENUE", handIndex: i };
    }
  }

  return { type: "ADVANCE_PHASE" };
}

function getSongAction(
  card: Card,
  handIndex: number,
  player: GameState["players"][0],
  opponent: GameState["players"][0]
): GameAction | null {
  if (card.type !== "song") return null;

  switch (card.effect) {
    case "fortissimo": {
      if (opponent.stage.length === 0) return null;
      // Target enemy with lowest currentTone
      let bestTarget = 0;
      let lowestTone = Infinity;
      for (let t = 0; t < opponent.stage.length; t++) {
        if (opponent.stage[t].currentTone < lowestTone) {
          lowestTone = opponent.stage[t].currentTone;
          bestTarget = t;
        }
      }
      return { type: "PLAY_SONG", handIndex, targets: [bestTarget] };
    }

    case "lullaby": {
      if (opponent.stage.length === 0) return null;
      // Target enemy with highest resonance
      let bestTarget = 0;
      let highestRes = -1;
      for (let t = 0; t < opponent.stage.length; t++) {
        if (opponent.stage[t].card.resonance > highestRes) {
          highestRes = opponent.stage[t].card.resonance;
          bestTarget = t;
        }
      }
      return { type: "PLAY_SONG", handIndex, targets: [bestTarget] };
    }

    case "crescendo": {
      if (player.stage.length === 0) return null;
      // Target own musician with highest volume
      let bestTarget = 0;
      let highestVol = -1;
      for (let t = 0; t < player.stage.length; t++) {
        if (player.stage[t].card.volume > highestVol) {
          highestVol = player.stage[t].card.volume;
          bestTarget = t;
        }
      }
      return { type: "PLAY_SONG", handIndex, targets: [bestTarget] };
    }

    case "encore":
      return { type: "PLAY_SONG", handIndex };

    default:
      return null;
  }
}

function getRiffAction(
  card: Card,
  handIndex: number,
  player: GameState["players"][0]
): GameAction | null {
  if (card.type !== "riff" || player.stage.length === 0) return null;

  switch (card.effect) {
    case "whammy-bar":
    case "power-amp": {
      // Volume riffs on front-row/mid-stage attackers
      let bestTarget = 0;
      let bestScore = -1;
      for (let t = 0; t < player.stage.length; t++) {
        const m = player.stage[t];
        const zoneScore = m.zone === "front-row" ? 2 : m.zone === "mid-stage" ? 1 : 0;
        const score = m.card.volume + zoneScore;
        if (score > bestScore) {
          bestScore = score;
          bestTarget = t;
        }
      }
      return { type: "ATTACH_RIFF", handIndex, targetMusicianIndex: bestTarget };
    }

    case "feedback-loop": {
      // Resonance riffs on back-line musicians
      let bestTarget = 0;
      let bestScore = -1;
      for (let t = 0; t < player.stage.length; t++) {
        const m = player.stage[t];
        const zoneScore = m.zone === "back-line" ? 2 : 0;
        const score = m.card.resonance + zoneScore;
        if (score > bestScore) {
          bestScore = score;
          bestTarget = t;
        }
      }
      return { type: "ATTACH_RIFF", handIndex, targetMusicianIndex: bestTarget };
    }

    default:
      return null;
  }
}

function getStrikeAction(state: GameState, playerIndex: 0 | 1): GameAction {
  // No attacks on turn 1
  if (state.turnNumber === 1) {
    return { type: "ADVANCE_PHASE" };
  }

  const player = state.players[playerIndex];
  const oppIdx = playerIndex === 0 ? 1 : 0;
  const oppStage = state.players[oppIdx].stage;

  if (oppStage.length === 0 || player.stage.length === 0) {
    return { type: "ADVANCE_PHASE" };
  }

  const attacks: { attackerIndex: number; targetIndex: number }[] = [];
  const usedAttackers = new Set<number>();

  // For each non-back-line musician, find valid targets
  const attackerCandidates: { index: number; volume: number }[] = [];
  for (let i = 0; i < player.stage.length; i++) {
    const m = player.stage[i];
    if (m.zone === "back-line") continue;
    if (m.discordantTurnsRemaining > 0) continue;
    const targets = getValidTargets(m.zone, m.card.range, oppStage);
    if (targets.length > 0) {
      attackerCandidates.push({ index: i, volume: m.card.volume });
    }
  }

  if (attackerCandidates.length === 0) {
    return { type: "ADVANCE_PHASE" };
  }

  // Priority: target enemies that would be KO'd, then lowest-tone
  // Track cumulative damage to each target
  const targetDamage = new Map<number, number>();

  for (const attacker of attackerCandidates) {
    if (usedAttackers.has(attacker.index)) continue;

    const m = player.stage[attacker.index];
    const validTargets = getValidTargets(m.zone, m.card.range, oppStage);
    if (validTargets.length === 0) continue;

    // Find best target
    let bestTarget = validTargets[0];
    let bestScore = -Infinity;

    for (const t of validTargets) {
      const target = oppStage[t];
      const existingDmg = targetDamage.get(t) ?? 0;
      const remainingTone = target.currentTone - existingDmg;

      // Would this KO them?
      const wouldKO = remainingTone <= attacker.volume;
      // Prefer KOs, then lowest remaining tone, spread damage
      const score = wouldKO ? 1000 - remainingTone : -remainingTone;

      if (score > bestScore) {
        bestScore = score;
        bestTarget = t;
      }
    }

    attacks.push({ attackerIndex: attacker.index, targetIndex: bestTarget });
    usedAttackers.add(attacker.index);
    targetDamage.set(bestTarget, (targetDamage.get(bestTarget) ?? 0) + attacker.volume);
  }

  if (attacks.length > 0) {
    return { type: "DECLARE_ATTACKS", attacks };
  }

  return { type: "ADVANCE_PHASE" };
}

function getDiscardAction(state: GameState, playerIndex: 0 | 1): GameAction {
  const player = state.players[playerIndex];
  const handLimit = 7;
  const excess = player.hand.length - handLimit;

  if (excess <= 0) {
    return { type: "ADVANCE_PHASE" };
  }

  // Discard highest-cost cards first; among equal cost, prefer musicians over songs
  const indexed = player.hand.map((card, i) => ({ card, i }));
  indexed.sort((a, b) => {
    if (b.card.cost !== a.card.cost) return b.card.cost - a.card.cost;
    // Prefer discarding musicians over songs/riffs
    const typeOrder = (c: Card) => c.type === "musician" ? 0 : 1;
    return typeOrder(a.card) - typeOrder(b.card);
  });

  const indices = indexed.slice(0, excess).map((x) => x.i);
  return { type: "DISCARD_CARDS", indices };
}
