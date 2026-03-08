import type { GameState } from "../types/game";
import type { GameController } from "../game/controller";
import type { TurnPhase } from "../types/game";
import type { GameAction } from "../game/actions";
import { getAIAction } from "./strategy";

type AIStrategy = (state: GameState, playerIndex: 0 | 1) => GameAction;

const PLAYER_INPUT_PHASES: Set<TurnPhase> = new Set([
  "soundcheck",
  "deploy",
  "equip-song",
  "strike",
  "discard",
]);

export class AIRunner {
  private stopped = false;
  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;
  private strategy: AIStrategy;

  constructor(
    private controller: GameController,
    private aiPlayerIndex: 0 | 1,
    private config: { delayMs: number; strategy?: AIStrategy } = { delayMs: 800 }
  ) {
    this.strategy = config.strategy ?? getAIAction;
  }

  /** If it's the AI's turn and a player-input phase, start auto-playing */
  checkAndRun(): void {
    if (this.stopped) return;

    const state = this.controller.getState();
    const win = this.controller.getWinResult();
    if (win) return;

    if (state.activePlayerIndex !== this.aiPlayerIndex) return;
    if (!PLAYER_INPUT_PHASES.has(state.currentPhase)) return;

    // Schedule the next AI action with a delay
    if (this.pendingTimeout !== null) return; // Already scheduled

    this.pendingTimeout = setTimeout(() => {
      this.pendingTimeout = null;
      if (this.stopped) return;

      const currentState = this.controller.getState();
      const currentWin = this.controller.getWinResult();
      if (currentWin) return;
      if (currentState.activePlayerIndex !== this.aiPlayerIndex) return;

      const action = this.strategy(currentState, this.aiPlayerIndex);

      // Defer dispatch to avoid dispatching inside a dispatch callback
      setTimeout(() => {
        if (this.stopped) return;
        this.controller.dispatch(action);
      }, 0);
    }, this.config.delayMs);
  }

  stop(): void {
    this.stopped = true;
    if (this.pendingTimeout !== null) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
  }

  isAITurn(): boolean {
    const state = this.controller.getState();
    return state.activePlayerIndex === this.aiPlayerIndex;
  }
}
