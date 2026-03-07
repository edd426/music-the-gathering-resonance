import type { Card } from "../types/cards";
import {
  SNARE_STRIKER, CYMBAL_CRASHER, TIMPANI_THUNDERER, WAR_DRUMMER,
  GLITCH_DJ, SYNTH_OPERATOR, BASS_DROP, CIRCUIT_BENDER,
  UKULELE_STRUMMER, VIOLIN_VIRTUOSO, CELLO_SAGE, HARP_WEAVER,
  CHOIR_INITIATE, BARITONE_BARD, ALTO_ENCHANTRESS, OPERA_DIVA,
  FORTISSIMO, CRESCENDO, LULLABY, ENCORE,
  POWER_AMP, WHAMMY_BAR, FEEDBACK_LOOP,
  THE_DIVE_BAR, THE_GRAND_AMPHITHEATER,
} from "./catalog";

function copies(card: Card, n: number): Card[] {
  return Array.from({ length: n }, () => ({ ...card }));
}

/** Aggro deck: Percussion + Electronic. High volume, aims to Clear the Stage. (30 cards) */
export function createRhythmAndRuinDeck(): Card[] {
  return [
    // Musicians (20)
    ...copies(SNARE_STRIKER, 3),       // 3
    ...copies(CYMBAL_CRASHER, 3),      // 6
    ...copies(TIMPANI_THUNDERER, 3),   // 9
    ...copies(WAR_DRUMMER, 2),         // 11
    ...copies(GLITCH_DJ, 3),           // 14
    ...copies(SYNTH_OPERATOR, 3),      // 17
    ...copies(BASS_DROP, 2),           // 19
    ...copies(CIRCUIT_BENDER, 1),      // 20
    // Songs & Riffs (8)
    ...copies(FORTISSIMO, 3),          // 23
    ...copies(POWER_AMP, 3),           // 26
    ...copies(FEEDBACK_LOOP, 2),       // 28
    // Venues (2)
    ...copies(THE_DIVE_BAR, 2),        // 30
  ];
}

/** Control deck: Strings + Voice. High resonance, aims for Silence win. (30 cards) */
export function createHarmonyRisingDeck(): Card[] {
  return [
    // Musicians (19)
    ...copies(UKULELE_STRUMMER, 3),    // 3
    ...copies(VIOLIN_VIRTUOSO, 3),     // 6
    ...copies(CELLO_SAGE, 2),          // 8
    ...copies(HARP_WEAVER, 2),         // 10
    ...copies(CHOIR_INITIATE, 3),      // 13
    ...copies(BARITONE_BARD, 3),       // 16
    ...copies(ALTO_ENCHANTRESS, 2),    // 18
    ...copies(OPERA_DIVA, 1),          // 19
    // Songs & Riffs (10)
    ...copies(CRESCENDO, 3),           // 22
    ...copies(ENCORE, 2),              // 24
    ...copies(LULLABY, 3),             // 27
    ...copies(WHAMMY_BAR, 2),          // 29
    // Venues (1)
    ...copies(THE_GRAND_AMPHITHEATER, 1), // 30
  ];
}
