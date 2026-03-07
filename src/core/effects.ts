import type { EffectContext, EffectFunction, EffectResult } from "../types/effects";
import type { GameState } from "../types/game";
import { updatePlayer } from "./state";
import { tapResources, getAvailableResources } from "./soundcheck";

const effectRegistry = new Map<string, EffectFunction>();

/** Register a card effect by card ID */
export function registerEffect(cardId: string, fn: EffectFunction): void {
  effectRegistry.set(cardId, fn);
}

/** Look up and apply a registered effect */
export function resolveEffect(cardId: string, ctx: EffectContext): EffectResult {
  const fn = effectRegistry.get(cardId);
  if (!fn) {
    return { state: ctx.state, message: "No effect registered" };
  }
  return fn(ctx);
}

/** Clear all registered effects (useful for testing) */
export function clearEffects(): void {
  effectRegistry.clear();
}

/** Play a Song card from hand: pay cost, apply effect, move to discard */
export function playSongCard(
  state: GameState,
  playerIndex: 0 | 1,
  handIndex: number,
  targets?: number[]
): GameState {
  const player = state.players[playerIndex];
  const card = player.hand[handIndex];

  if (!card || card.type !== "song") {
    throw new Error("Not a Song card");
  }

  if (getAvailableResources(player) < card.cost) {
    throw new Error("Insufficient resources");
  }

  let newState = tapResources(state, playerIndex, card.cost);

  const { state: effectState } = resolveEffect(card.id, {
    state: newState,
    playerIndex,
    targets,
  });
  newState = effectState;

  const updatedPlayer = newState.players[playerIndex];
  const newHand = updatedPlayer.hand.filter((_, i) => i !== handIndex);
  const newDiscard = [...updatedPlayer.discard, card];

  return updatePlayer(newState, playerIndex, {
    hand: newHand,
    discard: newDiscard,
  });
}

/** Attach a Riff card to a deployed musician */
export function attachRiffCard(
  state: GameState,
  playerIndex: 0 | 1,
  handIndex: number,
  targetMusicianIndex: number
): GameState {
  const player = state.players[playerIndex];
  const card = player.hand[handIndex];

  if (!card || card.type !== "riff") {
    throw new Error("Not a Riff card");
  }

  if (targetMusicianIndex < 0 || targetMusicianIndex >= player.stage.length) {
    throw new Error("Invalid target musician");
  }

  if (getAvailableResources(player) < card.cost) {
    throw new Error("Insufficient resources");
  }

  const newState = tapResources(state, playerIndex, card.cost);

  const updatedPlayer = newState.players[playerIndex];
  const newHand = updatedPlayer.hand.filter((_, i) => i !== handIndex);
  const musician = updatedPlayer.stage[targetMusicianIndex];
  const newStage = [...updatedPlayer.stage];
  newStage[targetMusicianIndex] = {
    ...musician,
    attachedRiffs: [...musician.attachedRiffs, card],
  };

  return updatePlayer(newState, playerIndex, {
    hand: newHand,
    stage: newStage,
  });
}

/** Play a Venue card: pay cost, replace active venue, discard old */
export function applyVenueCard(
  state: GameState,
  playerIndex: 0 | 1,
  handIndex: number
): GameState {
  const player = state.players[playerIndex];
  const card = player.hand[handIndex];

  if (!card || card.type !== "venue") {
    throw new Error("Not a Venue card");
  }

  if (getAvailableResources(player) < card.cost) {
    throw new Error("Insufficient resources");
  }

  let newState = tapResources(state, playerIndex, card.cost);

  const updatedPlayer = newState.players[playerIndex];
  const newHand = updatedPlayer.hand.filter((_, i) => i !== handIndex);

  // Discard old venue if one exists
  let newDiscard = [...updatedPlayer.discard];
  if (newState.activeVenue) {
    newDiscard = [...newDiscard, newState.activeVenue];
  }

  newState = updatePlayer(newState, playerIndex, {
    hand: newHand,
    discard: newDiscard,
  });

  return { ...newState, activeVenue: card };
}
