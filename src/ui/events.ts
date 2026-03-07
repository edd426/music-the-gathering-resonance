import type { Card, Zone } from "../types/cards";
import type { Attack } from "../core";
import { getAvailableResources } from "../core";
import { GameController } from "../game/controller";
import type { GameAction } from "../game/actions";

export interface UIState {
  selectedCardIndex: number | null;
  selectedAttacker: number | null;
  validTargets: number[];
  pendingAttacks: Attack[];
  discardSelections: Set<number>;
  showTurnTransition: boolean;
  previousActivePlayer: number;
  gameMode: "pvp" | "ai" | "tutorial";
  isAITurn: boolean;
}

export function createInitialUIState(): UIState {
  return {
    selectedCardIndex: null,
    selectedAttacker: null,
    validTargets: [],
    pendingAttacks: [],
    discardSelections: new Set(),
    showTurnTransition: false,
    previousActivePlayer: 0,
    gameMode: "pvp",
    isAITurn: false,
  };
}

export function setupEventDelegation(
  app: HTMLElement,
  getController: () => GameController | null,
  getUIState: () => UIState,
  setUIState: (s: UIState) => void,
  rerender: () => void,
  onStartGame: (p1Name: string, p2Name: string, mode: "pvp" | "ai" | "tutorial") => void,
  callbacks?: {
    onTutorialAdvance?: () => void;
    onTutorialDismiss?: () => void;
    isActionAllowed?: (action: GameAction) => boolean;
    onReturnToMenu?: () => void;
    onToggleMute?: () => void;
  }
): void {
  app.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const controller = getController();
    const uiState = getUIState();

    // Start game modes
    if (target.closest("[data-action='start-pvp']")) {
      const p1Input = document.getElementById("p1-name") as HTMLInputElement | null;
      const p2Input = document.getElementById("p2-name") as HTMLInputElement | null;
      const p1Name = p1Input?.value?.trim() || "Player 1";
      const p2Name = p2Input?.value?.trim() || "Player 2";
      onStartGame(p1Name, p2Name, "pvp");
      return;
    }
    if (target.closest("[data-action='start-ai']")) {
      const p1Input = document.getElementById("p1-name") as HTMLInputElement | null;
      const p1Name = p1Input?.value?.trim() || "Player 1";
      onStartGame(p1Name, "AI Opponent", "ai");
      return;
    }
    if (target.closest("[data-action='start-tutorial']")) {
      onStartGame("You", "AI Tutor", "tutorial");
      return;
    }
    // Legacy support
    if (target.closest("[data-action='start-game']")) {
      const p1Input = document.getElementById("p1-name") as HTMLInputElement | null;
      const p2Input = document.getElementById("p2-name") as HTMLInputElement | null;
      const p1Name = p1Input?.value?.trim() || "Player 1";
      const p2Name = p2Input?.value?.trim() || "Player 2";
      onStartGame(p1Name, p2Name, "pvp");
      return;
    }

    // Mute toggle
    if (target.closest("[data-action='toggle-mute']")) {
      callbacks?.onToggleMute?.();
      return;
    }

    // Tutorial controls
    if (target.closest("[data-action='tutorial-next']")) {
      callbacks?.onTutorialAdvance?.();
      return;
    }
    if (target.closest("[data-action='tutorial-skip']")) {
      callbacks?.onTutorialDismiss?.();
      return;
    }

    // Return to main menu (must be before AI turn block)
    if (target.closest("[data-action='restart']")) {
      callbacks?.onReturnToMenu?.();
      return;
    }

    // Block clicks during AI turn
    if (uiState.isAITurn) return;

    if (!controller) return;
    const state = controller.getState();
    const phase = state.currentPhase;
    const activeIdx = state.activePlayerIndex;
    const activePlayer = state.players[activeIdx];

    // Dismiss turn transition
    if (target.closest("[data-action='dismiss-transition']")) {
      setUIState({ ...uiState, showTurnTransition: false });
      rerender();
      return;
    }

    // Skip soundcheck
    if (target.closest("[data-action='skip-soundcheck']")) {
      controller.dispatch({ type: "ADVANCE_PHASE" });
      checkTurnTransition(controller, uiState, setUIState);
      return;
    }

    // Cancel selection
    if (target.closest("[data-action='cancel-selection']")) {
      setUIState({
        ...uiState,
        selectedCardIndex: null,
        selectedAttacker: null,
        validTargets: [],
      });
      rerender();
      return;
    }

    // Advance phase
    if (target.closest("[data-action='advance']")) {
      resetSelections(uiState, setUIState);
      controller.dispatch({ type: "ADVANCE_PHASE" });
      checkTurnTransition(controller, uiState, setUIState);
      return;
    }

    // Resolve attacks
    if (target.closest("[data-action='resolve-attacks']")) {
      if (uiState.pendingAttacks.length > 0) {
        controller.dispatch({
          type: "DECLARE_ATTACKS",
          attacks: [...uiState.pendingAttacks],
        });
        setUIState({
          ...uiState,
          pendingAttacks: [],
          selectedAttacker: null,
          validTargets: [],
        });
      }
      return;
    }

    // Confirm discard
    if (target.closest("[data-action='confirm-discard']")) {
      const indices = Array.from(uiState.discardSelections);
      controller.dispatch({ type: "DISCARD_CARDS", indices });
      setUIState({ ...uiState, discardSelections: new Set() });
      checkTurnTransition(controller, uiState, setUIState);
      return;
    }

    // Zone click (deploy target)
    const zoneEl = target.closest("[data-zone]") as HTMLElement | null;
    if (zoneEl && phase === "deploy" && uiState.selectedCardIndex !== null) {
      const zone = zoneEl.dataset.zone as Zone;
      controller.dispatch({
        type: "DEPLOY",
        handIndex: uiState.selectedCardIndex,
        zone,
      });
      setUIState({ ...uiState, selectedCardIndex: null });
      return;
    }

    // Attacker selection (strike phase)
    const attackerEl = target.closest("[data-attacker]") as HTMLElement | null;
    if (attackerEl && phase === "strike") {
      const attackerIndex = parseInt(attackerEl.dataset.attacker!, 10);
      const validTargets = controller.getValidTargetsForAttacker(attackerIndex);
      setUIState({
        ...uiState,
        selectedAttacker: attackerIndex,
        validTargets,
      });
      rerender();
      return;
    }

    // Target selection (strike phase)
    const targetEl = target.closest("[data-target]") as HTMLElement | null;
    if (targetEl && phase === "strike" && uiState.selectedAttacker !== null) {
      const targetIndex = parseInt(targetEl.dataset.target!, 10);
      const newAttacks = [
        ...uiState.pendingAttacks,
        { attackerIndex: uiState.selectedAttacker, targetIndex },
      ];
      setUIState({
        ...uiState,
        pendingAttacks: newAttacks,
        selectedAttacker: null,
        validTargets: [],
      });
      rerender();
      return;
    }

    // Equip-song phase: musician selection for riffs and targeted songs
    if (phase === "equip-song" && uiState.selectedCardIndex !== null) {
      const clickedMusician = target.closest("[data-attacker]") as HTMLElement | null;
      if (clickedMusician) {
        const card = activePlayer.hand[uiState.selectedCardIndex];
        const musicianIndex = parseInt(clickedMusician.dataset.attacker!, 10);
        const musicianPlayer = parseInt(clickedMusician.dataset.player!, 10);

        if (card?.type === "riff" && musicianPlayer === activeIdx) {
          controller.dispatch({
            type: "ATTACH_RIFF",
            handIndex: uiState.selectedCardIndex,
            targetMusicianIndex: musicianIndex,
          });
          setUIState({ ...uiState, selectedCardIndex: null });
          return;
        }

        if (card?.type === "song") {
          if (card.effect === "crescendo" && musicianPlayer === activeIdx) {
            controller.dispatch({
              type: "PLAY_SONG",
              handIndex: uiState.selectedCardIndex,
              targets: [musicianIndex],
            });
            setUIState({ ...uiState, selectedCardIndex: null });
            return;
          }
          if ((card.effect === "fortissimo" || card.effect === "lullaby") && musicianPlayer !== activeIdx) {
            controller.dispatch({
              type: "PLAY_SONG",
              handIndex: uiState.selectedCardIndex,
              targets: [musicianIndex],
            });
            setUIState({ ...uiState, selectedCardIndex: null });
            return;
          }
        }
      }
    }

    // Card click in hand
    const cardEl = target.closest("[data-hand-index]") as HTMLElement | null;
    if (cardEl) {
      const handIndex = parseInt(cardEl.dataset.handIndex!, 10);
      const card = activePlayer.hand[handIndex];
      if (!card) return;

      handleCardClick(
        card, handIndex, phase, activePlayer, activeIdx,
        controller, uiState, setUIState, rerender
      );
      return;
    }
  });
}

function handleCardClick(
  card: Card,
  handIndex: number,
  phase: string,
  activePlayer: { hand: Card[]; soundcheck: { tapped: boolean }[] },
  _activeIdx: 0 | 1,
  controller: GameController,
  uiState: UIState,
  setUIState: (s: UIState) => void,
  rerender: () => void
): void {
  const resources = getAvailableResources(activePlayer);

  switch (phase) {
    case "soundcheck":
      controller.dispatch({ type: "PLAY_SOUNDCHECK", handIndex });
      break;

    case "deploy":
      if (card.type === "musician" && resources >= card.cost) {
        setUIState({ ...uiState, selectedCardIndex: handIndex });
        rerender();
      }
      break;

    case "equip-song":
      if (card.type === "song" && resources >= card.cost) {
        // Songs that need targets
        if (card.effect === "crescendo") {
          // For MVP: target own musician — needs selection
          // Use first musician as auto-target for simplicity? No, let's use selectedCardIndex
          setUIState({ ...uiState, selectedCardIndex: handIndex });
          rerender();
          return;
        }
        if (card.effect === "fortissimo" || card.effect === "lullaby") {
          setUIState({ ...uiState, selectedCardIndex: handIndex });
          rerender();
          return;
        }
        // No target needed (encore)
        controller.dispatch({ type: "PLAY_SONG", handIndex });
      } else if (card.type === "riff" && resources >= card.cost) {
        setUIState({ ...uiState, selectedCardIndex: handIndex });
        rerender();
      } else if (card.type === "venue" && resources >= card.cost) {
        controller.dispatch({ type: "PLAY_VENUE", handIndex });
      }
      break;

    case "discard": {
      const newSelections = new Set(uiState.discardSelections);
      if (newSelections.has(handIndex)) {
        newSelections.delete(handIndex);
      } else {
        newSelections.add(handIndex);
      }
      setUIState({ ...uiState, discardSelections: newSelections });
      rerender();
      break;
    }
  }
}

function resetSelections(uiState: UIState, setUIState: (s: UIState) => void): void {
  setUIState({
    ...uiState,
    selectedCardIndex: null,
    selectedAttacker: null,
    validTargets: [],
    pendingAttacks: [],
    discardSelections: new Set(),
  });
}

function checkTurnTransition(
  controller: GameController,
  uiState: UIState,
  setUIState: (s: UIState) => void
): void {
  const newState = controller.getState();
  if (newState.activePlayerIndex !== uiState.previousActivePlayer) {
    // Skip turn transition for AI/tutorial modes
    const skipTransition = uiState.gameMode === "ai" || uiState.gameMode === "tutorial";
    setUIState({
      ...createInitialUIState(),
      showTurnTransition: !skipTransition,
      previousActivePlayer: newState.activePlayerIndex,
      gameMode: uiState.gameMode,
      isAITurn: uiState.isAITurn,
    });
  }
}
