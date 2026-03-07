export {
  createInitialGameState,
  getActivePlayer,
  getOpponent,
  opponentIndex,
  updatePlayer,
  updateMusician,
} from "./state";

export { shuffleDeck, drawCards } from "./deck";

export {
  playSoundcheck,
  refreshSoundcheck,
  tapResources,
  getAvailableResources,
} from "./soundcheck";

export { checkWinCondition } from "./win";
export type { WinResult } from "./win";

export {
  detectChords,
  computeChordBonuses,
  computeEnsembleBonus,
  getEffectiveVolume,
  getEffectiveResonance,
  applyDiscordantOnChordBreak,
} from "./chords";
export type { ChordGroup } from "./chords";

export {
  registerEffect,
  resolveEffect,
  clearEffects,
  playSongCard,
  attachRiffCard,
  applyVenueCard,
} from "./effects";

export { canDeploy, deployMusician } from "./deploy";

export { calculateResonance, applyResonance } from "./resonance";

export {
  isZoneBlocked,
  getValidTargets,
  resolveAllStrikes,
} from "./combat";
export type { Attack } from "./combat";

export {
  advancePhase,
  endTurn,
  calculateInitiative,
  discardToHandLimit,
} from "./turns";
