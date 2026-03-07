/** The five instrument factions */
export type Faction =
  | "winds"
  | "percussion"
  | "strings"
  | "electronic"
  | "voice";

/** Zones on the stage battlefield */
export type Zone = "front-row" | "mid-stage" | "back-line";

/** Range determines targeting reach */
export type Range = "melee" | "mid-reach" | "sniper";

/** Base interface for all cards */
export interface BaseCard {
  id: string;
  name: string;
  cost: number;
  faction: Faction;
  description: string;
}

/** Musician cards — the creatures of the game */
export interface MusicianCard extends BaseCard {
  type: "musician";
  volume: number;
  tone: number;
  tempo: number;
  range: Range;
  resonance: number;
  ability?: string;
}

/** Song cards — instant/spell effects */
export interface SongCard extends BaseCard {
  type: "song";
  effect: string;
}

/** Riff cards — equipment that attaches to musicians */
export interface RiffCard extends BaseCard {
  type: "riff";
  effect: string;
}

/** Venue cards — field-wide modifiers (only one active at a time) */
export interface VenueCard extends BaseCard {
  type: "venue";
  effect: string;
}

export type Card = MusicianCard | SongCard | RiffCard | VenueCard;
