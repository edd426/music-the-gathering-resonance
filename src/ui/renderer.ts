import type { GameState } from "../types/game";
import type { WinResult } from "../core";
import { getAvailableResources } from "../core";
import { renderHarmonyMeter } from "./components/harmony-meter";
import { renderPhaseBar } from "./components/phase-bar";
import { renderSoundcheckDisplay } from "./components/soundcheck-display";
import { renderBattlefield } from "./components/battlefield";
import { renderHand } from "./components/hand";
import { renderGameLog } from "./components/game-log";
import { renderWinScreen } from "./components/win-screen";
import type { UIState } from "./events";
import type { LogEntry } from "../game/log";

export interface RenderOptions {
  tutorialMessage?: string | null;
  tutorialShowNext?: boolean;
  showAIBanner?: boolean;
  isTutorial?: boolean;
  highlightSelector?: string | null;
  isMuted?: boolean;
}

export function renderGame(
  state: GameState,
  winResult: WinResult | null,
  logEntries: readonly LogEntry[],
  uiState: UIState,
  options?: RenderOptions
): string {
  const activeIdx = state.activePlayerIndex;
  const activePlayer = state.players[activeIdx];
  const opponentIdx = activeIdx === 0 ? 1 : 0;
  const opponent = state.players[opponentIdx];

  // Determine selectable/targetable musicians based on phase
  const selectableAttackers = new Set<number>();
  const attackTargets = new Set<number>();
  const ownSelectableMusicians = new Set<number>();
  const opponentSelectableMusicians = new Set<number>();

  if (state.currentPhase === "strike" && uiState.selectedAttacker === null) {
    activePlayer.stage.forEach((m, i) => {
      if (m.zone !== "back-line") selectableAttackers.add(i);
    });
  }

  if (state.currentPhase === "strike" && uiState.selectedAttacker !== null) {
    for (const t of uiState.validTargets) {
      attackTargets.add(t);
    }
  }

  // Equip-song phase: mark targetable musicians for selected song/riff
  if (state.currentPhase === "equip-song" && uiState.selectedCardIndex !== null) {
    const card = activePlayer.hand[uiState.selectedCardIndex];
    if (card?.type === "riff" || (card?.type === "song" && card.effect === "crescendo")) {
      activePlayer.stage.forEach((_, i) => ownSelectableMusicians.add(i));
    }
    if (card?.type === "song" && (card.effect === "fortissimo" || card.effect === "lullaby")) {
      opponent.stage.forEach((_, i) => opponentSelectableMusicians.add(i));
    }
  }

  const showZoneTargets =
    state.currentPhase === "deploy" && uiState.selectedCardIndex !== null;

  // Turn transition check
  if (uiState.showTurnTransition) {
    return `
      <div class="turn-transition" data-action="dismiss-transition">
        <div class="turn-transition-content">
          <h2>Pass to ${activePlayer.name}</h2>
          <p>Click anywhere to continue</p>
        </div>
      </div>
    `;
  }

  const tutorialMsg = options?.tutorialMessage;
  const showAI = options?.showAIBanner;
  const isTutorial = options?.isTutorial;

  const html = `
    ${isTutorial ? renderTutorialSkipButton() : ""}

    <div class="header">
      <h1>RESONANCE</h1>
      <div class="phase-info">Turn ${state.turnNumber} · ${activePlayer.name}'s turn</div>
      <button class="mute-btn" data-action="toggle-mute">${options?.isMuted ? "🔇" : "🔊"}</button>
    </div>

    ${renderPhaseBar(state.currentPhase)}

    ${showAI ? renderAIBanner() : ""}

    ${tutorialMsg ? renderTutorialTooltip(tutorialMsg, options?.tutorialShowNext ?? false) : ""}

    <!-- Opponent area -->
    <div class="player-area opponent">
      <div class="player-header">
        <span class="player-name">${opponent.name}</span>
        ${renderHarmonyMeter(opponent.harmony)}
      </div>
      ${renderSoundcheckDisplay(opponent.soundcheck)}
      ${renderBattlefield({
        stage: opponent.stage,
        playerIndex: opponentIdx,
        isActivePlayer: false,
        showZoneTargets: false,
        selectableAttackers: opponentSelectableMusicians,
        attackTargets,
        isOpponent: true,
      })}
      <div class="stat-summary">Hand: ${opponent.hand.length} · Deck: ${opponent.deck.length}</div>
    </div>

    ${state.activeVenue ? `<div class="venue-banner">Venue: ${state.activeVenue.name}</div>` : ""}

    <!-- Active player area -->
    <div class="player-area active">
      <div class="player-header">
        <span class="player-name active-turn">${activePlayer.name}</span>
        ${renderHarmonyMeter(activePlayer.harmony)}
      </div>
      ${renderSoundcheckDisplay(activePlayer.soundcheck)}
      ${renderBattlefield({
        stage: activePlayer.stage,
        playerIndex: activeIdx,
        isActivePlayer: true,
        showZoneTargets,
        selectableAttackers: new Set([...selectableAttackers, ...ownSelectableMusicians]),
        attackTargets: new Set(),
        isOpponent: false,
      })}
    </div>

    <!-- Action bar -->
    ${renderActionBar(state, uiState)}

    <!-- Hand -->
    ${renderHand({
      cards: activePlayer.hand,
      availableResources: getAvailableResources(activePlayer),
      phase: state.currentPhase,
      selectedIndices: uiState.selectedCardIndex !== null ? new Set([uiState.selectedCardIndex]) : new Set(),
    })}

    <!-- Pending attacks -->
    ${renderPendingAttacks(state, uiState)}

    <!-- Log -->
    ${renderGameLog(logEntries)}

    <!-- Win overlay -->
    ${winResult ? renderWinScreen(winResult, state.players[winResult.winner].name) : ""}
  `;

  return html;
}

function renderActionBar(state: GameState, uiState: UIState): string {
  const phase = state.currentPhase;
  const buttons: string[] = [];

  switch (phase) {
    case "soundcheck":
      buttons.push(`<button class="action-btn" data-action="skip-soundcheck">Skip Soundcheck</button>`);
      buttons.push(`<button class="action-btn primary" data-action="advance">Done</button>`);
      break;
    case "deploy":
      if (uiState.selectedCardIndex !== null) {
        buttons.push(`<button class="action-btn" data-action="cancel-selection">Cancel</button>`);
      }
      buttons.push(`<span class="instruction-text">Deploys left: ${state.deploysRemaining}</span>`);
      buttons.push(`<button class="action-btn primary" data-action="advance">Done Deploying</button>`);
      break;
    case "equip-song":
      if (uiState.selectedCardIndex !== null) {
        const card = state.players[state.activePlayerIndex].hand[uiState.selectedCardIndex];
        if (card?.type === "riff") {
          buttons.push(`<span class="instruction-text">Select your musician to attach to</span>`);
        } else if (card?.type === "song" && card.effect === "crescendo") {
          buttons.push(`<span class="instruction-text">Select your musician to boost</span>`);
        } else if (card?.type === "song" && (card.effect === "fortissimo" || card.effect === "lullaby")) {
          buttons.push(`<span class="instruction-text">Select an enemy musician to target</span>`);
        }
        buttons.push(`<button class="action-btn" data-action="cancel-selection">Cancel</button>`);
      }
      buttons.push(`<button class="action-btn primary" data-action="advance">Done</button>`);
      break;
    case "strike":
      if (uiState.selectedAttacker !== null) {
        buttons.push(`<span class="instruction-text">Select a target</span>`);
        buttons.push(`<button class="action-btn" data-action="cancel-selection">Cancel</button>`);
      }
      if (uiState.pendingAttacks.length > 0) {
        buttons.push(`<button class="action-btn primary" data-action="resolve-attacks">Resolve Attacks (${uiState.pendingAttacks.length})</button>`);
      }
      buttons.push(`<button class="action-btn" data-action="advance">Skip/End Strikes</button>`);
      break;
    case "discard":
      buttons.push(`<span class="instruction-text discard-warning">Discard to hand limit (7)</span>`);
      if (uiState.discardSelections.size > 0) {
        buttons.push(`<button class="action-btn primary" data-action="confirm-discard">Discard Selected (${uiState.discardSelections.size})</button>`);
      }
      break;
    default:
      break;
  }

  return `<div class="action-bar">${buttons.join("")}</div>`;
}

function renderPendingAttacks(state: GameState, uiState: UIState): string {
  if (uiState.pendingAttacks.length === 0) return "";

  const activePlayer = state.players[state.activePlayerIndex];
  const oppIdx = state.activePlayerIndex === 0 ? 1 : 0;
  const opponent = state.players[oppIdx];

  const lines = uiState.pendingAttacks.map((atk) => {
    const attacker = activePlayer.stage[atk.attackerIndex];
    const target = opponent.stage[atk.targetIndex];
    return `<div class="pending-entry">${attacker?.card.name ?? "?"} → ${target?.card.name ?? "?"}</div>`;
  }).join("");

  return `<div class="pending-attacks-box">
    <div class="pending-label">Pending Attacks</div>
    ${lines}
  </div>`;
}

export function renderStartScreen(): string {
  return `
    <div class="start-screen">
      <div class="start-title-area">
        <h1>RESONANCE</h1>
        <h2>Battle of the Bands</h2>
      </div>
      <div class="start-form">
        <input type="text" id="p1-name" placeholder="Your name" value="Player 1" />
        <div class="instruction-text">Deck: Rhythm & Ruin (Percussion + Electronic)</div>
        <input type="text" id="p2-name" placeholder="Player 2 name" value="Player 2" />
        <div class="instruction-text">Deck: Harmony Rising (Strings + Voice)</div>
        <div class="mode-buttons">
          <button class="mode-btn primary" data-action="start-tutorial">
            Tutorial
            <div class="mode-desc">Learn how to play with a guided game</div>
          </button>
          <button class="mode-btn" data-action="start-ai">
            Player vs AI
            <div class="mode-desc">Play against a computer opponent</div>
          </button>
          <button class="mode-btn" data-action="start-pvp">
            Player vs Player
            <div class="mode-desc">Two players, same screen</div>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderTutorialTooltip(message: string, showNext: boolean): string {
  return `
    <div class="tutorial-tooltip">
      <div class="tutorial-text">${message}</div>
      <div class="tutorial-actions">
        ${showNext ? `<button class="primary" data-action="tutorial-next">Next</button>` : ""}
      </div>
    </div>
  `;
}

export function renderAIBanner(): string {
  return `<div class="ai-thinking-banner">AI is thinking...</div>`;
}

export function renderTutorialSkipButton(): string {
  return `<button class="tutorial-skip-btn" data-action="tutorial-skip">Skip Tutorial</button>`;
}
