import type { MusicianCard, SongCard, RiffCard, VenueCard, Card } from "../types/cards";

// --- Musicians (20 total, 4 per faction) ---

export const PICCOLO_PIPER: MusicianCard = {
  id: "mus-winds-01",
  name: "Piccolo Piper",
  type: "musician",
  faction: "winds",
  cost: 1,
  volume: 1,
  tone: 3,
  tempo: 2,
  range: "melee",
  resonance: 1,
  description: "A nimble piper whose shrill notes cut through the noise.",
};

export const CLARINET_SENTINEL: MusicianCard = {
  id: "mus-winds-02",
  name: "Clarinet Sentinel",
  type: "musician",
  faction: "winds",
  cost: 2,
  volume: 2,
  tone: 4,
  tempo: 2,
  range: "mid-reach",
  resonance: 1,
  description: "Steady and watchful, the sentinel holds the mid-stage.",
};

export const TRUMPET_HERALD: MusicianCard = {
  id: "mus-winds-03",
  name: "Trumpet Herald",
  type: "musician",
  faction: "winds",
  cost: 3,
  volume: 3,
  tone: 3,
  tempo: 3,
  range: "melee",
  resonance: 0,
  description: "Announces the charge with a blazing fanfare.",
};

export const TUBA_BASTION: MusicianCard = {
  id: "mus-winds-04",
  name: "Tuba Bastion",
  type: "musician",
  faction: "winds",
  cost: 4,
  volume: 2,
  tone: 5,
  tempo: 1,
  range: "melee",
  resonance: 2,
  description: "An immovable wall of deep brass tones.",
};

export const SNARE_STRIKER: MusicianCard = {
  id: "mus-perc-01",
  name: "Snare Striker",
  type: "musician",
  faction: "percussion",
  cost: 1,
  volume: 2,
  tone: 3,
  tempo: 3,
  range: "melee",
  resonance: 0,
  description: "Quick rattling strikes that never let up.",
};

export const CYMBAL_CRASHER: MusicianCard = {
  id: "mus-perc-02",
  name: "Cymbal Crasher",
  type: "musician",
  faction: "percussion",
  cost: 2,
  volume: 3,
  tone: 2,
  tempo: 4,
  range: "melee",
  resonance: 0,
  description: "A deafening crash that shakes the stage.",
};

export const TIMPANI_THUNDERER: MusicianCard = {
  id: "mus-perc-03",
  name: "Timpani Thunderer",
  type: "musician",
  faction: "percussion",
  cost: 3,
  volume: 4,
  tone: 3,
  tempo: 2,
  range: "mid-reach",
  resonance: 0,
  description: "Rolling thunder that reaches across the battlefield.",
};

export const WAR_DRUMMER: MusicianCard = {
  id: "mus-perc-04",
  name: "War Drummer",
  type: "musician",
  faction: "percussion",
  cost: 4,
  volume: 3,
  tone: 4,
  tempo: 3,
  range: "mid-reach",
  resonance: 1,
  description: "Sets the tempo of battle with thunderous beats.",
};

export const UKULELE_STRUMMER: MusicianCard = {
  id: "mus-str-01",
  name: "Ukulele Strummer",
  type: "musician",
  faction: "strings",
  cost: 1,
  volume: 1,
  tone: 3,
  tempo: 3,
  range: "melee",
  resonance: 1,
  description: "Light strumming that lifts the spirit.",
};

export const VIOLIN_VIRTUOSO: MusicianCard = {
  id: "mus-str-02",
  name: "Violin Virtuoso",
  type: "musician",
  faction: "strings",
  cost: 2,
  volume: 2,
  tone: 3,
  tempo: 4,
  range: "mid-reach",
  resonance: 1,
  description: "Precise bowing that strikes from a distance.",
};

export const CELLO_SAGE: MusicianCard = {
  id: "mus-str-03",
  name: "Cello Sage",
  type: "musician",
  faction: "strings",
  cost: 3,
  volume: 2,
  tone: 4,
  tempo: 2,
  range: "mid-reach",
  resonance: 2,
  description: "Deep, resonant tones that anchor the ensemble.",
};

export const HARP_WEAVER: MusicianCard = {
  id: "mus-str-04",
  name: "Harp Weaver",
  type: "musician",
  faction: "strings",
  cost: 3,
  volume: 1,
  tone: 3,
  tempo: 2,
  range: "sniper",
  resonance: 3,
  description: "Ethereal harmonies that reach anywhere on the stage.",
};

export const GLITCH_DJ: MusicianCard = {
  id: "mus-elec-01",
  name: "Glitch DJ",
  type: "musician",
  faction: "electronic",
  cost: 1,
  volume: 2,
  tone: 3,
  tempo: 5,
  range: "melee",
  resonance: 0,
  description: "Chaotic beats from corrupted samples.",
};

export const SYNTH_OPERATOR: MusicianCard = {
  id: "mus-elec-02",
  name: "Synth Operator",
  type: "musician",
  faction: "electronic",
  cost: 2,
  volume: 3,
  tone: 2,
  tempo: 3,
  range: "mid-reach",
  resonance: 0,
  description: "Waves of synthesized sound that sweep the stage.",
};

export const BASS_DROP: MusicianCard = {
  id: "mus-elec-03",
  name: "Bass Drop",
  type: "musician",
  faction: "electronic",
  cost: 3,
  volume: 4,
  tone: 2,
  tempo: 1,
  range: "melee",
  resonance: 0,
  description: "One massive hit that rattles everything.",
};

export const CIRCUIT_BENDER: MusicianCard = {
  id: "mus-elec-04",
  name: "Circuit Bender",
  type: "musician",
  faction: "electronic",
  cost: 4,
  volume: 2,
  tone: 3,
  tempo: 3,
  range: "sniper",
  resonance: 2,
  description: "Rewires the signal to strike from any distance.",
};

export const CHOIR_INITIATE: MusicianCard = {
  id: "mus-voice-01",
  name: "Choir Initiate",
  type: "musician",
  faction: "voice",
  cost: 1,
  volume: 1,
  tone: 3,
  tempo: 2,
  range: "melee",
  resonance: 1,
  description: "A young voice learning the power of song.",
};

export const BARITONE_BARD: MusicianCard = {
  id: "mus-voice-02",
  name: "Baritone Bard",
  type: "musician",
  faction: "voice",
  cost: 2,
  volume: 2,
  tone: 3,
  tempo: 2,
  range: "melee",
  resonance: 1,
  description: "Rich tones that inspire nearby allies.",
};

export const ALTO_ENCHANTRESS: MusicianCard = {
  id: "mus-voice-03",
  name: "Alto Enchantress",
  type: "musician",
  faction: "voice",
  cost: 3,
  volume: 1,
  tone: 4,
  tempo: 3,
  range: "mid-reach",
  resonance: 3,
  description: "Mesmerizing melodies that drain the opponent's will.",
};

export const OPERA_DIVA: MusicianCard = {
  id: "mus-voice-04",
  name: "Opera Diva",
  type: "musician",
  faction: "voice",
  cost: 5,
  volume: 3,
  tone: 5,
  tempo: 1,
  range: "sniper",
  resonance: 3,
  description: "Her voice shatters glass and spirits alike.",
};

// --- Songs (4 total) ---

export const CRESCENDO: SongCard = {
  id: "song-crescendo",
  name: "Crescendo",
  type: "song",
  faction: "strings",
  cost: 2,
  effect: "crescendo",
  description: "Target musician gets +3 Volume this turn.",
};

export const FORTISSIMO: SongCard = {
  id: "song-fortissimo",
  name: "Fortissimo",
  type: "song",
  faction: "percussion",
  cost: 1,
  effect: "fortissimo",
  description: "Deal 2 damage to target enemy musician.",
};

export const LULLABY: SongCard = {
  id: "song-lullaby",
  name: "Lullaby",
  type: "song",
  faction: "voice",
  cost: 2,
  effect: "lullaby",
  description: "Make target enemy musician discordant for 1 turn.",
};

export const ENCORE: SongCard = {
  id: "song-encore",
  name: "Encore",
  type: "song",
  faction: "strings",
  cost: 2,
  effect: "encore",
  description: "Draw 2 cards.",
};

// --- Riffs (3 total) ---

export const WHAMMY_BAR: RiffCard = {
  id: "riff-whammy-bar",
  name: "Whammy Bar",
  type: "riff",
  faction: "strings",
  cost: 1,
  effect: "whammy-bar",
  description: "Attached musician gets +1 Volume.",
};

export const FEEDBACK_LOOP: RiffCard = {
  id: "riff-feedback-loop",
  name: "Feedback Loop",
  type: "riff",
  faction: "electronic",
  cost: 2,
  effect: "feedback-loop",
  description: "Attached musician gets +1 Resonance.",
};

export const POWER_AMP: RiffCard = {
  id: "riff-power-amp",
  name: "Power Amp",
  type: "riff",
  faction: "percussion",
  cost: 2,
  effect: "power-amp",
  description: "Attached musician gets +2 Volume.",
};

// --- Venues (2 total) ---

export const THE_DIVE_BAR: VenueCard = {
  id: "venue-dive-bar",
  name: "The Dive Bar",
  type: "venue",
  faction: "percussion",
  cost: 2,
  effect: "dive-bar",
  description: "A gritty venue where the crowd thrives on chaos.",
};

export const THE_GRAND_AMPHITHEATER: VenueCard = {
  id: "venue-grand-amphitheater",
  name: "The Grand Amphitheater",
  type: "venue",
  faction: "voice",
  cost: 3,
  effect: "grand-amphitheater",
  description: "An elegant hall that amplifies every note.",
};

// --- Special cards ---

/** Free starting resource — not drawn from hand */
export const TUNING_FORK: Card = {
  id: "special-tuning-fork",
  name: "Tuning Fork",
  type: "musician",
  faction: "strings",
  cost: 0,
  volume: 0,
  tone: 0,
  tempo: 0,
  range: "melee",
  resonance: 0,
  description: "A free starting resource to tune up your band.",
};

// --- Full catalog lookup ---

export const ALL_CARDS: Card[] = [
  PICCOLO_PIPER, CLARINET_SENTINEL, TRUMPET_HERALD, TUBA_BASTION,
  SNARE_STRIKER, CYMBAL_CRASHER, TIMPANI_THUNDERER, WAR_DRUMMER,
  UKULELE_STRUMMER, VIOLIN_VIRTUOSO, CELLO_SAGE, HARP_WEAVER,
  GLITCH_DJ, SYNTH_OPERATOR, BASS_DROP, CIRCUIT_BENDER,
  CHOIR_INITIATE, BARITONE_BARD, ALTO_ENCHANTRESS, OPERA_DIVA,
  CRESCENDO, FORTISSIMO, LULLABY, ENCORE,
  WHAMMY_BAR, FEEDBACK_LOOP, POWER_AMP,
  THE_DIVE_BAR, THE_GRAND_AMPHITHEATER,
];

export function getCardById(id: string): Card | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}
