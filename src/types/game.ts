import type { Card, MusicianCard, RiffCard, VenueCard, Zone } from "./cards";

/** A musician placed on the stage */
export interface DeployedMusician {
  card: MusicianCard;
  zone: Zone;
  currentTone: number;
  discordantTurnsRemaining: number;
  attachedRiffs: RiffCard[];
}

/** A card played face-down as a Soundcheck resource */
export interface SoundcheckResource {
  card: Card;
  tapped: boolean;
}

/** One player's state */
export interface PlayerState {
  name: string;
  harmony: number;
  hand: Card[];
  deck: Card[];
  discard: Card[];
  stage: DeployedMusician[];
  soundcheck: SoundcheckResource[];
}

/** The phases of a turn */
export type TurnPhase =
  | "refresh"
  | "draw"
  | "soundcheck"
  | "deploy"
  | "equip-song"
  | "strike"
  | "resonance"
  | "discard";

/** Full game state */
export interface GameState {
  players: [PlayerState, PlayerState];
  activePlayerIndex: 0 | 1;
  currentPhase: TurnPhase;
  turnNumber: number;
  activeVenue: VenueCard | null;
  deploysRemaining: number;
  soundcheckPlayedThisTurn: boolean;
  lastRoundDamage: [number, number];
  initiativePlayerIndex: 0 | 1;
  totalDeploys: [number, number];
}

/** Game constants */
export const GAME_CONFIG = {
  STARTING_HARMONY: 20,
  DECK_SIZE: 30,
  STARTING_HAND: 5,
  DRAW_PER_TURN: 2,
  HAND_LIMIT: 7,
  DEPLOY_LIMIT: 2,
  SOUNDCHECK_PER_TURN: 1,
  FREE_STARTING_RESOURCES: 1,
} as const;
