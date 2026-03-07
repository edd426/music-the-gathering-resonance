import type { Zone } from "../types/cards";
import type { GameState } from "../types/game";
import { updatePlayer } from "./state";
import { tapResources, getAvailableResources } from "./soundcheck";

/** Check if a deploy action is valid without mutating state */
export function canDeploy(
  state: GameState,
  playerIndex: 0 | 1,
  handIndex: number
): boolean {
  const player = state.players[playerIndex];
  const card = player.hand[handIndex];

  if (!card || card.type !== "musician") return false;
  if (state.deploysRemaining <= 0) return false;
  if (getAvailableResources(player) < card.cost) return false;

  return true;
}

/** Deploy a musician from hand to a zone on the stage */
export function deployMusician(
  state: GameState,
  playerIndex: 0 | 1,
  handIndex: number,
  zone: Zone
): GameState {
  const player = state.players[playerIndex];
  const card = player.hand[handIndex];

  if (!card || card.type !== "musician") {
    throw new Error("Not a Musician card");
  }

  if (state.deploysRemaining <= 0) {
    throw new Error("No deploys remaining this turn");
  }

  if (getAvailableResources(player) < card.cost) {
    throw new Error("Insufficient resources");
  }

  let newState = tapResources(state, playerIndex, card.cost);

  const updatedPlayer = newState.players[playerIndex];
  const newHand = updatedPlayer.hand.filter((_, i) => i !== handIndex);
  const newStage = [
    ...updatedPlayer.stage,
    {
      card,
      zone,
      currentTone: card.tone,
      discordantTurnsRemaining: 0,
      attachedRiffs: [],
    },
  ];

  newState = updatePlayer(newState, playerIndex, {
    hand: newHand,
    stage: newStage,
  });

  const newTotalDeploys = [...state.totalDeploys] as [number, number];
  newTotalDeploys[playerIndex]++;

  return {
    ...newState,
    deploysRemaining: state.deploysRemaining - 1,
    totalDeploys: newTotalDeploys,
  };
}
