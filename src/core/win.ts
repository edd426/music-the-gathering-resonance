import type { GameState } from "../types/game";

export interface WinResult {
  winner: 0 | 1;
  condition: "silence" | "clear-the-stage";
}

/** Check if either player has won */
export function checkWinCondition(state: GameState): WinResult | null {
  for (const idx of [0, 1] as const) {
    const opponentIdx = idx === 0 ? 1 : 0;
    const opponent = state.players[opponentIdx];

    // Silence: opponent's Harmony <= 0
    if (opponent.harmony <= 0) {
      return { winner: idx, condition: "silence" };
    }

    // Clear the Stage: opponent has no musicians, has ever deployed, and it's turn 3+
    if (
      opponent.stage.length === 0 &&
      state.totalDeploys[opponentIdx] > 0 &&
      state.turnNumber >= 3
    ) {
      return { winner: idx, condition: "clear-the-stage" };
    }
  }

  return null;
}
