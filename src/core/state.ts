import type { Card } from "../types/cards";
import type {
  GameState,
  PlayerState,
  DeployedMusician,
} from "../types/game";
import { GAME_CONFIG } from "../types/game";
import { shuffleDeck, drawCards } from "./deck";
import { TUNING_FORK } from "../cards/catalog";

export interface InitOptions {
  skipShuffle?: boolean;
}

/** Create initial game state from player names and decks */
export function createInitialGameState(
  p1Name: string,
  p1Deck: Card[],
  p2Name: string,
  p2Deck: Card[],
  rng?: () => number,
  options?: InitOptions
): GameState {
  if (p1Deck.length !== GAME_CONFIG.DECK_SIZE) {
    throw new Error(
      `Player 1 deck must have ${GAME_CONFIG.DECK_SIZE} cards, got ${p1Deck.length}`
    );
  }
  if (p2Deck.length !== GAME_CONFIG.DECK_SIZE) {
    throw new Error(
      `Player 2 deck must have ${GAME_CONFIG.DECK_SIZE} cards, got ${p2Deck.length}`
    );
  }

  const random = rng ?? Math.random;
  const initiativePlayerIndex: 0 | 1 = random() < 0.5 ? 0 : 1;
  const shuffleRng = options?.skipShuffle ? null : rng;

  // Build free starting resources
  const freeResources = Array.from(
    { length: GAME_CONFIG.FREE_STARTING_RESOURCES },
    () => ({ card: TUNING_FORK, tapped: false })
  );

  const createPlayer = (name: string, deck: Card[]): PlayerState => ({
    name,
    harmony: GAME_CONFIG.STARTING_HARMONY,
    hand: [],
    deck: shuffleDeck(deck, shuffleRng),
    discard: [],
    stage: [],
    soundcheck: [...freeResources],
  });

  let state: GameState = {
    players: [
      createPlayer(p1Name, p1Deck),
      createPlayer(p2Name, p2Deck),
    ],
    activePlayerIndex: initiativePlayerIndex,
    currentPhase: "refresh",
    turnNumber: 1,
    activeVenue: null,
    deploysRemaining: GAME_CONFIG.DEPLOY_LIMIT,
    soundcheckPlayedThisTurn: false,
    lastRoundDamage: [0, 0],
    initiativePlayerIndex,
    totalDeploys: [0, 0],
  };

  state = drawCards(state, 0, GAME_CONFIG.STARTING_HAND);
  state = drawCards(state, 1, GAME_CONFIG.STARTING_HAND);

  return state;
}

/** Get the active player's state */
export function getActivePlayer(state: GameState): PlayerState {
  return state.players[state.activePlayerIndex];
}

/** Get the opponent's state */
export function getOpponent(state: GameState): PlayerState {
  return state.players[opponentIndex(state.activePlayerIndex)];
}

/** Get the opponent's index */
export function opponentIndex(playerIndex: 0 | 1): 0 | 1 {
  return playerIndex === 0 ? 1 : 0;
}

/** Immutably update a player's state */
export function updatePlayer(
  state: GameState,
  playerIndex: 0 | 1,
  updates: Partial<PlayerState>
): GameState {
  const newPlayers = [...state.players] as [PlayerState, PlayerState];
  newPlayers[playerIndex] = { ...newPlayers[playerIndex], ...updates };
  return { ...state, players: newPlayers };
}

/** Immutably update a deployed musician on a player's stage */
export function updateMusician(
  state: GameState,
  playerIndex: 0 | 1,
  musicianIndex: number,
  updates: Partial<DeployedMusician>
): GameState {
  const player = state.players[playerIndex];
  const newStage = [...player.stage];
  newStage[musicianIndex] = { ...newStage[musicianIndex], ...updates };
  return updatePlayer(state, playerIndex, { stage: newStage });
}
