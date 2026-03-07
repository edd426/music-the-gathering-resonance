import type { Card, MusicianCard, Zone } from "../types/cards";
import type {
  GameState,
  PlayerState,
  DeployedMusician,
} from "../types/game";
import { GAME_CONFIG } from "../types/game";

/** Seeded pseudo-random number generator (mulberry32) */
export function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let nextId = 1;

/** Create a test musician card with sensible defaults */
export function createTestMusician(
  overrides: Partial<MusicianCard> = {}
): MusicianCard {
  const id = `test-musician-${nextId++}`;
  return {
    id,
    name: `Test Musician ${id}`,
    type: "musician",
    cost: 1,
    faction: "strings",
    description: "A test musician",
    volume: 2,
    tone: 3,
    tempo: 1,
    range: "melee",
    resonance: 1,
    ...overrides,
  };
}

/** Create a generic test card (musician by default) */
export function createTestCard(
  overrides: Partial<MusicianCard> = {}
): Card {
  return createTestMusician(overrides);
}

/** Create a deployed musician on the stage */
export function createDeployedMusician(
  zone: Zone = "front-row",
  overrides: Partial<MusicianCard> = {}
): DeployedMusician {
  const card = createTestMusician(overrides);
  return {
    card,
    zone,
    currentTone: card.tone,
    discordantTurnsRemaining: 0,
    attachedRiffs: [],
  };
}

/** Build a test deck of N cards */
export function createTestDeck(size: number = GAME_CONFIG.DECK_SIZE): Card[] {
  return Array.from({ length: size }, (_, i) =>
    createTestMusician({ id: `deck-card-${nextId++}`, cost: ((i % 3) + 1) })
  );
}

/** Create a minimal valid player state */
export function createTestPlayer(
  name: string = "Test Player",
  deckSize: number = GAME_CONFIG.DECK_SIZE
): PlayerState {
  const deck = createTestDeck(deckSize);
  return {
    name,
    harmony: GAME_CONFIG.STARTING_HARMONY,
    hand: [],
    deck,
    discard: [],
    stage: [],
    soundcheck: [],
  };
}

/** Create a minimal valid game state for testing */
export function createTestState(
  overrides: Partial<GameState> = {}
): GameState {
  return {
    players: [createTestPlayer("Player 1"), createTestPlayer("Player 2")],
    activePlayerIndex: 0,
    currentPhase: "deploy",
    turnNumber: 1,
    activeVenue: null,
    deploysRemaining: GAME_CONFIG.DEPLOY_LIMIT,
    soundcheckPlayedThisTurn: false,
    lastRoundDamage: [0, 0],
    initiativePlayerIndex: 0,
    totalDeploys: [0, 0],
    ...overrides,
  };
}

/** Reset the auto-incrementing ID counter (call in beforeEach) */
export function resetTestIds(): void {
  nextId = 1;
}
