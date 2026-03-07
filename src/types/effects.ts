import type { GameState } from "./game";

/** Context passed to card effect functions */
export interface EffectContext {
  state: GameState;
  playerIndex: 0 | 1;
  targets?: number[];
}

/** Result of applying a card effect */
export interface EffectResult {
  state: GameState;
  message?: string;
}

/** A function that implements a card's effect */
export type EffectFunction = (ctx: EffectContext) => EffectResult;
