import type { GameState } from "../types/game";
import type { GameAction } from "../game/actions";
import { TUTORIAL_STEPS, type TutorialStep } from "./steps";

export class TutorialController {
  private currentStepIndex = 0;
  private dismissed = false;
  private freePlay = false;

  constructor(
    private onUpdate: () => void
  ) {}

  getCurrentStep(): TutorialStep | null {
    if (this.freePlay || this.dismissed) return null;
    if (this.currentStepIndex >= TUTORIAL_STEPS.length) return null;
    return TUTORIAL_STEPS[this.currentStepIndex];
  }

  /** Check if an action is allowed given the current tutorial step */
  isActionAllowed(action: GameAction): boolean {
    const step = this.getCurrentStep();
    if (!step || step.allowFreePlay) return true;

    // In restrictive steps, allow specific actions
    if (step.id === "soundcheck-explain") {
      return action.type === "PLAY_SOUNDCHECK";
    }
    if (step.id === "soundcheck-done") {
      return action.type === "ADVANCE_PHASE";
    }

    // Default: allow the action
    return true;
  }

  /** Called after each state change to advance tutorial steps */
  checkProgression(state: GameState): void {
    if (this.freePlay || this.dismissed) return;

    const step = this.getCurrentStep();
    if (!step) {
      this.freePlay = true;
      return;
    }

    // Non-waiting steps auto-advance when conditions change
    if (!step.waitForAction) {
      // "Next" button steps — advanced by user clicking Next
      if (step.id === "welcome") return;
      if (step.id === "explain-resources") return;
      if (step.id === "zones-explain") return;

      if (step.id === "ai-turn-1") {
        // Advance when it's player 0's turn again (turn 2)
        if (state.activePlayerIndex === 0 && state.turnNumber >= 2) {
          this.advance();
        }
        return;
      }
      if (step.id === "ai-turn-2") {
        // Advance when it's player 0's turn again (turn 3)
        if (state.activePlayerIndex === 0 && state.turnNumber >= 3) {
          this.advance();
        }
        return;
      }
      if (step.id === "strike-skipped") {
        // Auto-advance once we've passed strike phase
        if (state.currentPhase !== "strike") {
          this.advance();
          this.checkProgression(state);
        }
        return;
      }
      if (step.id === "free-play") {
        this.freePlay = true;
        return;
      }
    }

    // Phase-matching: if step expects a specific phase and we've moved past it
    if (step.phase !== null && step.playerTurn === 0) {
      if (state.activePlayerIndex !== 0) {
        // It's the opponent's turn — skip to AI turn step or free-play step
        this.advanceToNextApplicable(state);
        return;
      }
      if (state.currentPhase !== step.phase) {
        // We're in a different phase — the step was satisfied, advance
        this.advance();
        // Check the new step too
        this.checkProgression(state);
        return;
      }
    }
  }

  /** Advance to the next tutorial step */
  advance(): void {
    if (this.currentStepIndex < TUTORIAL_STEPS.length) {
      this.currentStepIndex++;
      if (this.currentStepIndex >= TUTORIAL_STEPS.length) {
        this.freePlay = true;
      }
      this.onUpdate();
    }
  }

  /** Skip forward to the next step that matches the current game state */
  private advanceToNextApplicable(state: GameState): void {
    for (let i = this.currentStepIndex + 1; i < TUTORIAL_STEPS.length; i++) {
      const step = TUTORIAL_STEPS[i];
      if (step.phase === null && step.playerTurn === null) {
        this.currentStepIndex = i;
        this.onUpdate();
        return;
      }
      if (step.playerTurn === null || step.playerTurn === state.activePlayerIndex) {
        if (step.phase === null || step.phase === state.currentPhase) {
          this.currentStepIndex = i;
          this.onUpdate();
          return;
        }
      }
    }
    // No matching step found — enter free play
    this.freePlay = true;
    this.onUpdate();
  }

  getMessage(): { text: string } | null {
    const step = this.getCurrentStep();
    if (!step) return null;
    return { text: step.message };
  }

  getHighlightSelector(): string | null {
    const step = this.getCurrentStep();
    if (!step) return null;
    return step.highlightSelector;
  }

  isComplete(): boolean {
    return this.freePlay || this.dismissed;
  }

  dismiss(): void {
    this.dismissed = true;
    this.onUpdate();
  }
}
