import type { GameState } from "../types/game";
import type { GameAction } from "../game/actions";
import { getAIAction } from "../ai/strategy";
import { getAvailableResources, getValidTargets } from "../core";

/**
 * Scripted tutorial AI — predictable behavior for turns 1-2,
 * falls back to regular AI strategy from turn 3+.
 */
export function getTutorialAIAction(state: GameState, playerIndex: 0 | 1): GameAction {
  if (state.turnNumber <= 2) {
    const action = getScriptedAction(state, playerIndex);
    if (action) return action;
  }
  return getAIAction(state, playerIndex);
}

function getScriptedAction(state: GameState, playerIndex: 0 | 1): GameAction | null {
  const player = state.players[playerIndex];

  if (state.turnNumber === 1) {
    switch (state.currentPhase) {
      case "soundcheck": {
        if (state.soundcheckPlayedThisTurn) return { type: "ADVANCE_PHASE" };
        // Sacrifice Choir Initiate (cheapest musician)
        const idx = player.hand.findIndex((c) => c.name === "Choir Initiate");
        if (idx >= 0) return { type: "PLAY_SOUNDCHECK", handIndex: idx };
        return { type: "ADVANCE_PHASE" };
      }
      case "deploy": {
        if (state.deploysRemaining <= 0) return { type: "ADVANCE_PHASE" };
        // Deploy Ukulele Strummer to front-row
        const idx = player.hand.findIndex((c) => c.name === "Ukulele Strummer");
        if (idx >= 0 && getAvailableResources(player) >= player.hand[idx].cost) {
          return { type: "DEPLOY", handIndex: idx, zone: "front-row" };
        }
        return { type: "ADVANCE_PHASE" };
      }
      case "equip-song":
        return { type: "ADVANCE_PHASE" };
      case "strike":
        return { type: "ADVANCE_PHASE" };
      default:
        return null;
    }
  }

  if (state.turnNumber === 2) {
    switch (state.currentPhase) {
      case "soundcheck": {
        if (state.soundcheckPlayedThisTurn) return { type: "ADVANCE_PHASE" };
        // Sacrifice Lullaby as soundcheck
        const idx = player.hand.findIndex((c) => c.name === "Lullaby");
        if (idx >= 0) return { type: "PLAY_SOUNDCHECK", handIndex: idx };
        return { type: "ADVANCE_PHASE" };
      }
      case "deploy": {
        if (state.deploysRemaining <= 0) return { type: "ADVANCE_PHASE" };
        // Deploy Baritone Bard to mid-stage (same faction as Ukulele Strummer for Chord)
        const idx = player.hand.findIndex((c) => c.name === "Baritone Bard");
        if (idx >= 0 && getAvailableResources(player) >= player.hand[idx].cost) {
          return { type: "DEPLOY", handIndex: idx, zone: "mid-stage" };
        }
        return { type: "ADVANCE_PHASE" };
      }
      case "equip-song":
        return { type: "ADVANCE_PHASE" };
      case "strike": {
        // Attack with Ukulele Strummer → player's front-row musician
        const oppIdx = playerIndex === 0 ? 1 : 0;
        const oppStage = state.players[oppIdx].stage;
        if (oppStage.length === 0 || player.stage.length === 0) {
          return { type: "ADVANCE_PHASE" };
        }
        // Find Ukulele Strummer on stage
        const attackerIdx = player.stage.findIndex((m) => m.card.name === "Ukulele Strummer");
        if (attackerIdx < 0) return { type: "ADVANCE_PHASE" };
        const attacker = player.stage[attackerIdx];
        if (attacker.zone === "back-line") return { type: "ADVANCE_PHASE" };
        const targets = getValidTargets(attacker.zone, attacker.card.range, oppStage);
        if (targets.length === 0) return { type: "ADVANCE_PHASE" };
        return {
          type: "DECLARE_ATTACKS",
          attacks: [{ attackerIndex: attackerIdx, targetIndex: targets[0] }],
        };
      }
      default:
        return null;
    }
  }

  return null;
}
