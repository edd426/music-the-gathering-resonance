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
    message: "Welcome to Resonance: Battle of the Bands! Drain your opponent's Harmony to 0, or clear all their musicians from the stage.",
    highlightSelector: null,
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: false,
    allowFreePlay: false,
  },
  {
    id: "explain-resources",
    message: "You start with 1 Tuning Fork \u2014 a free resource. Resources pay for cards. See the cost pips in each card's top-right corner.",
    highlightSelector: ".soundcheck-area",
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: false,
    allowFreePlay: false,
  },
  {
    id: "soundcheck-explain",
    message: "Sacrifice a card from your hand as another resource. Click a card to play it face-down. You'll have 2 resources to spend!",
    highlightSelector: "[data-hand-index]",
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: false,
  },
  {
    id: "soundcheck-done",
    message: "Click Done to move to deployment.",
    highlightSelector: "[data-action='advance']",
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: false,
  },
  {
    id: "zones-explain",
    message: "The stage has 3 zones: Front Row (attacks + gets attacked first), Mid Stage (attacks, shielded by Front Row), Back Line (can't attack, but drains enemy Harmony via Resonance).",
    highlightSelector: ".zone",
    phase: "deploy",
    playerTurn: 0,
    waitForAction: false,
    allowFreePlay: false,
  },
  {
    id: "deploy-explain",
    message: "Click a musician card, then click Front Row to place them. Your first musician should hold the front line!",
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
    message: "Songs and Riffs power up the stage. Nothing to play yet \u2014 click Done.",
    highlightSelector: "[data-action='advance']",
    phase: "equip-song",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "strike-skipped",
    message: "No attacks on turn 1 \u2014 build your board first!",
    highlightSelector: null,
    phase: null,
    playerTurn: null,
    waitForAction: false,
    allowFreePlay: true,
  },
  {
    id: "ai-turn-1",
    message: "Opponent's turn \u2014 watch them set up.",
    highlightSelector: null,
    phase: null,
    playerTurn: null,
    waitForAction: false,
    allowFreePlay: true,
  },

  // --- Turn 2: Combat & Songs ---
  {
    id: "turn2-soundcheck",
    message: "Turn 2! Play another resource for more spending power.",
    highlightSelector: "[data-hand-index]",
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "turn2-soundcheck-done",
    message: "Click Done when ready.",
    highlightSelector: "[data-action='advance']",
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "turn2-deploy",
    message: "Deploy another musician! Place them next to a same-faction ally for a Chord bonus (+1 Volume, +1 Tone).",
    highlightSelector: null,
    phase: "deploy",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "turn2-equip",
    message: "Try playing Fortissimo \u2014 it deals 2 damage to an enemy musician. Click the card, then click the target.",
    highlightSelector: null,
    phase: "equip-song",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "turn2-strike",
    message: "Now attack! Click your musician, pick an enemy target, then click Resolve Attacks. Combat is mutual \u2014 both deal damage!",
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

  // --- Turn 3: Free Play ---
  {
    id: "turn3-resonance",
    message: "Back Line musicians drain enemy Harmony with Resonance each turn. Try placing one there!",
    highlightSelector: null,
    phase: "soundcheck",
    playerTurn: 0,
    waitForAction: true,
    allowFreePlay: true,
  },
  {
    id: "free-play",
    message: "You've got the basics! Play to win.",
    highlightSelector: null,
    phase: null,
    playerTurn: null,
    waitForAction: false,
    allowFreePlay: true,
  },
];
