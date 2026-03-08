import { registerAllEffects } from "./cards/effects";
import { createRhythmAndRuinDeck, createHarmonyRisingDeck } from "./cards/decks";
import { GameController } from "./game/controller";
import { AIRunner } from "./ai";
import { TutorialController, createTutorialPlayerDeck, createTutorialAIDeck, getTutorialAIAction } from "./tutorial";
import { injectStyles } from "./ui/styles";
import { renderGame, renderStartScreen } from "./ui/renderer";
import type { RenderOptions } from "./ui/renderer";
import {
  setupEventDelegation,
  createInitialUIState,
} from "./ui/events";
import type { UIState } from "./ui/events";
import { AudioSystem } from "./audio";

// Register all card effects
registerAllEffects();

// Inject styles
injectStyles();

const app = document.getElementById("app")!;
let controller: GameController | null = null;
let uiState: UIState = createInitialUIState();
let aiRunner: AIRunner | null = null;
let tutorialController: TutorialController | null = null;
let audioSystem: AudioSystem | null = null;

function rerender(): void {
  if (!controller) {
    app.innerHTML = renderStartScreen();
    return;
  }

  const state = controller.getState();
  const winResult = controller.getWinResult();
  const logEntries = controller.getLog();

  // Build render options for AI/tutorial
  const options: RenderOptions = {
    isMuted: audioSystem?.isMuted() ?? false,
  };

  if (uiState.isAITurn && !winResult) {
    options.showAIBanner = true;
  }

  if (tutorialController && !tutorialController.isComplete()) {
    options.isTutorial = true;
    const msg = tutorialController.getMessage();
    if (msg) {
      options.tutorialMessage = msg.text;
      const step = tutorialController.getCurrentStep();
      options.tutorialShowNext = step ? !step.waitForAction : false;
    }
  }

  app.innerHTML = renderGame(state, winResult, logEntries, uiState, options);

  // After render, apply tutorial highlights
  if (tutorialController && !tutorialController.isComplete()) {
    const selector = tutorialController.getHighlightSelector();
    if (selector) {
      const elements = app.querySelectorAll(selector);
      elements.forEach((el) => el.setAttribute("data-tutorial-highlight", "true"));
    }
  }

  // Trigger AI if it's AI's turn
  if (aiRunner && aiRunner.isAITurn() && !winResult) {
    aiRunner.checkAndRun();
  }
}

function onStartGame(p1Name: string, p2Name: string, mode: "pvp" | "ai" | "tutorial"): void {
  // Cleanup previous
  aiRunner?.stop();
  aiRunner = null;
  tutorialController = null;

  if (mode === "tutorial") {
    // Tutorial: fixed decks, deterministic RNG (player 0 always goes first), no shuffle
    const p1Deck = createTutorialPlayerDeck();
    const p2Deck = createTutorialAIDeck();
    controller = new GameController(p1Name, p1Deck, p2Name, p2Deck, () => 0, { skipShuffle: true });

    tutorialController = new TutorialController(() => {
      rerender();
    });

    aiRunner = new AIRunner(controller, 1, { delayMs: 600, strategy: getTutorialAIAction });
  } else if (mode === "ai") {
    const p1Deck = createRhythmAndRuinDeck();
    const p2Deck = createHarmonyRisingDeck();
    controller = new GameController(p1Name, p1Deck, p2Name, p2Deck);

    aiRunner = new AIRunner(controller, 1, { delayMs: 800 });
  } else {
    const p1Deck = createRhythmAndRuinDeck();
    const p2Deck = createHarmonyRisingDeck();
    controller = new GameController(p1Name, p1Deck, p2Name, p2Deck);
  }

  // Initialize audio system (requires user gesture — start button click counts)
  if (!audioSystem) {
    audioSystem = new AudioSystem();
  }
  audioSystem.initialize().then(() => {
    audioSystem!.attachToController(controller!);
  });

  controller.onStateChange(() => {
    // Update AI turn state
    const state = controller!.getState();
    const isAI = aiRunner !== null && state.activePlayerIndex === 1;
    uiState = { ...uiState, isAITurn: isAI };

    // Tutorial progression
    if (tutorialController) {
      tutorialController.checkProgression(state);
    }

    rerender();
  });

  controller.start();
  uiState = {
    ...createInitialUIState(),
    previousActivePlayer: controller.getState().activePlayerIndex,
    gameMode: mode,
    isAITurn: mode !== "pvp" && controller.getState().activePlayerIndex === 1,
  };
  rerender();
}

function onReturnToMenu(): void {
  aiRunner?.stop();
  aiRunner = null;
  tutorialController = null;
  controller = null;
  audioSystem?.dispose();
  audioSystem = null;
  uiState = createInitialUIState();
  rerender();
}

setupEventDelegation(
  app,
  () => controller,
  () => uiState,
  (s) => { uiState = s; },
  rerender,
  onStartGame,
  {
    onTutorialAdvance: () => {
      tutorialController?.advance();
    },
    onTutorialDismiss: () => {
      tutorialController?.dismiss();
      rerender();
    },
    isActionAllowed: (action) => {
      if (!tutorialController) return true;
      const state = controller?.getState();
      return tutorialController.isActionAllowed(action, state ?? undefined);
    },
    isCardSelectable: (cardName) => {
      if (!tutorialController) return true;
      return tutorialController.isCardSelectable(cardName);
    },
    isZoneAllowed: (zone) => {
      if (!tutorialController) return true;
      return tutorialController.isZoneAllowed(zone);
    },
    onReturnToMenu,
    onToggleMute: () => {
      audioSystem?.toggleMute();
      rerender();
    },
  }
);

// Initial render — show start screen
rerender();
