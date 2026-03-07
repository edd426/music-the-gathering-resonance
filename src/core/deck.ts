import type { Card } from "../types/cards";
import type { GameState } from "../types/game";

/** Fisher-Yates shuffle with injectable RNG. Pass null to skip shuffling. */
export function shuffleDeck(deck: Card[], rng?: (() => number) | null): Card[] {
  const result = [...deck];
  if (rng === null) return result;
  const random = rng ?? Math.random;
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Draw cards from deck to hand, recycling discard pile if deck runs out */
export function drawCards(
  state: GameState,
  playerIndex: 0 | 1,
  count: number
): GameState {
  const player = state.players[playerIndex];
  let deck = [...player.deck];
  let discard = [...player.discard];
  const hand = [...player.hand];
  let remaining = count;

  while (remaining > 0 && (deck.length > 0 || discard.length > 0)) {
    if (deck.length === 0) {
      deck = shuffleDeck(discard);
      discard = [];
    }
    hand.push(deck[0]);
    deck = deck.slice(1);
    remaining--;
  }

  const newPlayers = [...state.players] as [typeof player, typeof player];
  newPlayers[playerIndex] = {
    ...player,
    hand,
    deck,
    discard,
  };

  return { ...state, players: newPlayers };
}
