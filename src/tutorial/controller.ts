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
  isActionAllowed(action: GameAction, state?: GameState): boolean {
    const step = this.getCurrentStep();
    if (!step || step.allowFreePlay) return true;

    // Steps that only allow ADVANCE_PHASE
    const advanceOnlySteps = new Set([
      "soundcheck-done", "deploy-done", "equip-skip",
      "turn2-soundcheck-done", "turn2-deploy-done", "turn2-equip-done",
    ]);
    if (advanceOnlySteps.has(step.id)) {
      return action.type === "ADVANCE_PHASE";
    }

    // Steps that require a specific card by name
    if (step.requiredCardName && state) {
      const player = state.players[state.activePlayerIndex];

      if (step.phase === "soundcheck" && action.type === "PLAY_SOUNDCHECK") {
        const card = player.hand[action.handIndex];
        return card?.name === step.requiredCardName;
      }

      if (step.phase === "deploy") {
        if (action.type === "DEPLOY") {
          const card = player.hand[action.handIndex];
          if (card?.name !== step.requiredCardName) return false;
          if (step.requiredZone && action.zone !== step.requiredZone) return false;
          return true;
        }
        // Allow selecting the card (no dispatch yet, just UI state)
        return false;
      }

      if (step.phase === "equip-song") {
        if (action.type === "PLAY_SONG" || action.type === "ATTACH_RIFF" || action.type === "PLAY_VENUE") {
          const card = player.hand[action.handIndex];
          return card?.name === step.requiredCardName;
        }
        return false;
      }
    }

    // Soundcheck step: only allow PLAY_SOUNDCHECK
    if (step.phase === "soundcheck" && step.waitForAction && !step.allowFreePlay) {
      return action.type === "PLAY_SOUNDCHECK";
    }

    // Default: allow the action
    return true;
  }

  /** Check if a specific card can be selected during this tutorial step */
  isCardSelectable(cardName: string): boolean {
    const step = this.getCurrentStep();
    if (!step || step.allowFreePlay) return true;
    if (!step.requiredCardName) return true;
    return cardName === step.requiredCardName;
  }

  /** Check if a specific zone can be targeted during this tutorial step */
  isZoneAllowed(zone: string): boolean {
    const step = this.getCurrentStep();
    if (!step || step.allowFreePlay) return true;
    if (!step.requiredZone) return true;
    return zone === step.requiredZone;
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
      if (step.id === "explain-stats") return;
      if (step.id === "explain-resources") return;
      if (step.id === "zones-explain") return;

      if (step.id === "ai-turn-1") {
        if (state.activePlayerIndex === 0 && state.turnNumber >= 2) {
          this.advance();
        }
        return;
      }
      if (step.id === "ai-turn-2") {
        if (state.activePlayerIndex === 0 && state.turnNumber >= 3) {
          this.advance();
        }
        return;
      }
      if (step.id === "strike-skipped") {
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

    // Specific waiting-step triggers based on game state
    if (step.id === "soundcheck-explain" && state.soundcheckPlayedThisTurn) {
      this.advance();
      this.checkProgression(state);
      return;
    }
    if (step.id === "turn2-soundcheck" && state.soundcheckPlayedThisTurn) {
      this.advance();
      this.checkProgression(state);
      return;
    }

    // Phase-matching: if step expects a specific phase and we've moved past it
    if (step.phase !== null && step.playerTurn === 0) {
      if (state.activePlayerIndex !== 0) {
        this.advanceToNextApplicable(state);
        return;
      }
      if (state.currentPhase !== step.phase) {
        this.advance();
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
