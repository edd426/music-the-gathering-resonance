import type { Zone } from "../types/cards";
import type { Attack } from "../core";

export type GameAction =
  | { type: "START_GAME" }
  | { type: "PLAY_SOUNDCHECK"; handIndex: number }
  | { type: "DEPLOY"; handIndex: number; zone: Zone }
  | { type: "PLAY_SONG"; handIndex: number; targets?: number[] }
  | { type: "ATTACH_RIFF"; handIndex: number; targetMusicianIndex: number }
  | { type: "PLAY_VENUE"; handIndex: number }
  | { type: "DECLARE_ATTACKS"; attacks: Attack[] }
  | { type: "DISCARD_CARDS"; indices: number[] }
  | { type: "ADVANCE_PHASE" };
