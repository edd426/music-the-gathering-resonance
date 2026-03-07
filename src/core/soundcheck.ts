import type { GameState } from "../types/game";
import { updatePlayer } from "./state";

/** Play a card from hand face-down as a Soundcheck resource */
export function playSoundcheck(
  state: GameState,
  playerIndex: 0 | 1,
  handIndex: number
): GameState {
  if (state.soundcheckPlayedThisTurn) {
    throw new Error("Already played a Soundcheck this turn");
  }

  const player = state.players[playerIndex];
  if (handIndex < 0 || handIndex >= player.hand.length) {
    throw new Error("Invalid hand index");
  }

  const card = player.hand[handIndex];
  const newHand = player.hand.filter((_, i) => i !== handIndex);
  const newSoundcheck = [
    ...player.soundcheck,
    { card, tapped: false },
  ];

  const newState = updatePlayer(state, playerIndex, {
    hand: newHand,
    soundcheck: newSoundcheck,
  });

  return { ...newState, soundcheckPlayedThisTurn: true };
}

/** Untap all Soundcheck resources for a player */
export function refreshSoundcheck(
  state: GameState,
  playerIndex: 0 | 1
): GameState {
  const player = state.players[playerIndex];
  const newSoundcheck = player.soundcheck.map((r) => ({
    ...r,
    tapped: false,
  }));
  return updatePlayer(state, playerIndex, { soundcheck: newSoundcheck });
}

/** Tap N resources to pay a cost */
export function tapResources(
  state: GameState,
  playerIndex: 0 | 1,
  count: number
): GameState {
  const player = state.players[playerIndex];
  const available = getAvailableResources(player);
  if (available < count) {
    throw new Error(
      `Insufficient resources: need ${count}, have ${available}`
    );
  }

  let remaining = count;
  const newSoundcheck = player.soundcheck.map((r) => {
    if (!r.tapped && remaining > 0) {
      remaining--;
      return { ...r, tapped: true };
    }
    return r;
  });

  return updatePlayer(state, playerIndex, { soundcheck: newSoundcheck });
}

/** Count untapped resources */
export function getAvailableResources(
  player: { soundcheck: { tapped: boolean }[] }
): number {
  return player.soundcheck.filter((r) => !r.tapped).length;
}
