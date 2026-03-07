import type { TurnPhase } from "../types/game";

export interface TutorialStep {
  id: string;
  message: string;
  highlightSelector: string | null;
  phase: TurnPhase | null;
  playerTurn: 0 | null;  // Tutorial player is always 0
  waitForAction: boolean;
  allowFreePlay: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // --- Turn 1: The Basics (no combat) ---
  {
    id: "welcome",
    message: "Welcome to Resonance! You start with a free Tuning Fork resource and 5 cards.",
    highlightSelector: null,
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: false,
    allowFreePlay: false,
  },
  {
    id: "soundcheck-explain",
    message: "Play a card face-down as a resource. You'll have 2 resources to spend.",
    highlightSelector: "[data-hand-index]",
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: false,
  },
  {
    id: "soundcheck-done",
    message: "Click Done to move on.",
    highlightSelector: "[data-action='advance']",
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: false,
  },
  {
    id: "deploy-explain",
    message: "Pick a musician from your hand, then place them on a zone.",
    highlightSelector: "[data-hand-index]",
    phase: "deploy",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "deploy-done",
    message: "Done deploying? Click Done Deploying.",
    highlightSelector: "[data-action='advance']",
    phase: "deploy",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "equip-skip",
    message: "Songs and riffs go here. Nothing to play yet — click Done.",
    highlightSelector: "[data-action='advance']",
    phase: "equip-song",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "strike-skipped",
    message: "No attacks on turn 1 — build your board first!",
    highlightSelector: null,
    phase: null,
    playerTurn: null,
    waitForAction: false,
    allowFreePlay: true,
  },
  {
    id: "ai-turn-1",
    message: "Opponent's turn — watch them deploy.",
    highlightSelector: null,
    phase: null,
    playerTurn: null,
    waitForAction: false,
    allowFreePlay: true,
  },

  // --- Turn 2: Combat & Songs ---
  {
    id: "turn2-soundcheck",
    message: "Play another resource. More resources = bigger plays.",
    highlightSelector: "[data-hand-index]",
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "turn2-deploy",
    message: "Deploy next to a same-faction musician for a Chord bonus!",
    highlightSelector: null,
    phase: "deploy",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "turn2-equip",
    message: "Try playing a Song card on an enemy musician.",
    highlightSelector: null,
    phase: "equip-song",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "turn2-strike",
    message: "Now you can attack! Select your musician, then pick a target. Combat is mutual — both deal damage!",
    highlightSelector: null,
    phase: "strike",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "ai-turn-2",
    message: "Watch the opponent fight back.",
    highlightSelector: null,
    phase: null,
    playerTurn: null,
    waitForAction: false,
    allowFreePlay: true,
  },

  // --- Turn 3: Advanced Mechanics ---
  {
    id: "turn3-resonance",
    message: "Back Line musicians drain enemy Harmony with Resonance each turn.",
    highlightSelector: null,
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },

  // --- Free play ---
  {
    id: "free-play",
    message: "You've got this! Play to win.",
    highlightSelector: null,
    phase: null,
    playerTurn: null,
    waitForAction: false,
    allowFreePlay: true,
  },
];
