import type { GameState, TurnPhase } from "../types/game";
import { GAME_CONFIG } from "../types/game";
import { drawCards } from "./deck";
import { refreshSoundcheck } from "./soundcheck";
import { applyResonance } from "./resonance";
import { opponentIndex, updatePlayer } from "./state";

const PHASE_ORDER: TurnPhase[] = [
  "refresh",
  "draw",
  "soundcheck",
  "deploy",
  "equip-song",
  "strike",
  "resonance",
  "discard",
];

/** Advance to the next phase, applying automatic effects for the new phase */
export function advancePhase(state: GameState): GameState {
  const currentIdx = PHASE_ORDER.indexOf(state.currentPhase);
  if (currentIdx === -1) {
    throw new Error(`Unknown phase: ${state.currentPhase}`);
  }

  const nextIdx = currentIdx + 1;

  // If we've reached the end of phases, end the turn
  if (nextIdx >= PHASE_ORDER.length) {
    return endTurn(state);
  }

  const nextPhase = PHASE_ORDER[nextIdx];
  let newState: GameState = { ...state, currentPhase: nextPhase };

  // Apply automatic effects for entering the new phase
  switch (nextPhase) {
    case "refresh":
      newState = applyRefreshPhase(newState);
      break;
    case "draw":
      // Skip draw on turn 1 — players start with their 5-card hand only
      if (newState.turnNumber > 1) {
        newState = drawCards(
          newState,
          newState.activePlayerIndex,
          GAME_CONFIG.DRAW_PER_TURN
        );
      }
      break;
    case "soundcheck":
      newState = { ...newState, soundcheckPlayedThisTurn: false };
      break;
    case "deploy":
      newState = { ...newState, deploysRemaining: GAME_CONFIG.DEPLOY_LIMIT };
      break;
    case "resonance":
      newState = applyResonance(newState);
      break;
  }

  return newState;
}

/** Apply refresh phase: untap resources, decrement discordant counters */
function applyRefreshPhase(state: GameState): GameState {
  const playerIdx = state.activePlayerIndex;
  const newState = refreshSoundcheck(state, playerIdx);

  // Decrement discordant turns
  const player = newState.players[playerIdx];
  const newStage = player.stage.map((m) => {
    if (m.discordantTurnsRemaining > 0) {
      return {
        ...m,
        discordantTurnsRemaining: m.discordantTurnsRemaining - 1,
      };
    }
    return m;
  });

  return updatePlayer(newState, playerIdx, { stage: newStage });
}

/** End the current turn: switch active player or advance round */
export function endTurn(state: GameState): GameState {
  const currentActive = state.activePlayerIndex;
  const otherPlayer = opponentIndex(currentActive);

  // Check if this is the second player's turn ending (both have gone)
  const isRoundEnd = currentActive !== state.initiativePlayerIndex;

  if (isRoundEnd) {
    // Both players have gone — advance round
    const newInitiative = calculateInitiative(state.lastRoundDamage);

    return {
      ...state,
      activePlayerIndex: newInitiative,
      currentPhase: "refresh",
      turnNumber: state.turnNumber + 1,
      deploysRemaining: GAME_CONFIG.DEPLOY_LIMIT,
      soundcheckPlayedThisTurn: false,
      lastRoundDamage: [0, 0],
      initiativePlayerIndex: newInitiative,
    };
  }

  // First player done — switch to second player
  return {
    ...state,
    activePlayerIndex: otherPlayer,
    currentPhase: "refresh",
    deploysRemaining: GAME_CONFIG.DEPLOY_LIMIT,
    soundcheckPlayedThisTurn: false,
  };
}

/** Calculate initiative: higher damage last round goes SECOND (catch-up mechanic) */
export function calculateInitiative(
  lastRoundDamage: [number, number],
  rng?: () => number
): 0 | 1 {
  if (lastRoundDamage[0] > lastRoundDamage[1]) {
    // Player 0 dealt more damage, so player 0 goes second — player 1 gets initiative
    return 1;
  }
  if (lastRoundDamage[1] > lastRoundDamage[0]) {
    return 0;
  }
  // Tie: random
  const random = rng ?? Math.random;
  return random() < 0.5 ? 0 : 1;
}

/** Player discards down to hand limit */
export function discardToHandLimit(
  state: GameState,
  playerIndex: 0 | 1,
  discardIndices: number[]
): GameState {
  const player = state.players[playerIndex];
  const expectedDiscards =
    player.hand.length - GAME_CONFIG.HAND_LIMIT;

  if (expectedDiscards <= 0) {
    return state; // No need to discard
  }

  if (discardIndices.length !== expectedDiscards) {
    throw new Error(
      `Must discard exactly ${expectedDiscards} cards, got ${discardIndices.length}`
    );
  }

  const discardSet = new Set(discardIndices);
  const discarded = player.hand.filter((_, i) => discardSet.has(i));
  const newHand = player.hand.filter((_, i) => !discardSet.has(i));

  return updatePlayer(state, playerIndex, {
    hand: newHand,
    discard: [...player.discard, ...discarded],
  });
}
