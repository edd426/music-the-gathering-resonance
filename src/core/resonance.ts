import type { GameState } from "../types/game";
import { getEffectiveResonance } from "./chords";
import { opponentIndex, updatePlayer } from "./state";

/** Calculate total resonance from a player's Back Line musicians */
export function calculateResonance(
  stage: { card: { resonance: number }; zone: string; discordantTurnsRemaining: number }[]
): number {
  // We need the full stage array to compute chord bonuses via getEffectiveResonance,
  // but this simple version just handles the type constraint
  return stage
    .filter((m) => m.zone === "back-line")
    .reduce((sum, m) => {
      if (m.discordantTurnsRemaining > 0) return sum;
      return sum + m.card.resonance;
    }, 0);
}

/** Apply resonance drain: active player's Back Line resonance drains opponent's Harmony */
export function applyResonance(state: GameState): GameState {
  const activeIdx = state.activePlayerIndex;
  const oppIdx = opponentIndex(activeIdx);
  const activePlayer = state.players[activeIdx];

  // Sum effective resonance (includes chord bonuses) for Back Line only
  let totalResonance = 0;
  for (let i = 0; i < activePlayer.stage.length; i++) {
    if (activePlayer.stage[i].zone === "back-line") {
      totalResonance += getEffectiveResonance(activePlayer.stage, i);
    }
  }

  if (totalResonance === 0) return state;

  const opponent = state.players[oppIdx];
  const newHarmony = Math.max(0, opponent.harmony - totalResonance);

  const newLastRoundDamage = [...state.lastRoundDamage] as [number, number];
  newLastRoundDamage[activeIdx] += totalResonance;

  return {
    ...updatePlayer(state, oppIdx, { harmony: newHarmony }),
    lastRoundDamage: newLastRoundDamage,
  };
}
