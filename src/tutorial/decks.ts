import type { Card } from "../types/cards";
import {
  SNARE_STRIKER, CYMBAL_CRASHER, TIMPANI_THUNDERER, WAR_DRUMMER,
  GLITCH_DJ, SYNTH_OPERATOR, BASS_DROP, CIRCUIT_BENDER,
  UKULELE_STRUMMER, VIOLIN_VIRTUOSO, CELLO_SAGE, HARP_WEAVER,
  CHOIR_INITIATE, BARITONE_BARD, ALTO_ENCHANTRESS,
  FORTISSIMO, CRESCENDO, LULLABY, ENCORE,
  POWER_AMP, WHAMMY_BAR, FEEDBACK_LOOP,
  THE_DIVE_BAR,
} from "../cards/catalog";

/**
 * Tutorial player deck — fixed order (skipShuffle=true).
 * Top of deck = index 0 = drawn first.
 * Starting hand will be the first 5 cards.
 * Designed for: free resource + 1 soundcheck = 2 resources on turn 1.
 */
export function createTutorialPlayerDeck(): Card[] {
  return [
    // Starting hand (5 cards)
    { ...GLITCH_DJ },           // Cost 1 — expendable for soundcheck
    { ...SNARE_STRIKER },       // Cost 1 — cheap deploy
    { ...CYMBAL_CRASHER },      // Cost 2 — better deploy after soundcheck
    { ...FORTISSIMO },          // Cost 1 — song for turn 2
    { ...TIMPANI_THUNDERER },   // Cost 3 — something to work toward

    // Draw Turn 2 (2 cards)
    { ...SYNTH_OPERATOR },      // Cost 2
    { ...POWER_AMP },           // Cost 2 — riff to teach equipping

    // Draw Turn 3 (2 cards)
    { ...BASS_DROP },           // Cost 3
    { ...FEEDBACK_LOOP },       // Cost 2 — resonance riff

    // Remaining cards to fill to 30
    { ...SNARE_STRIKER },
    { ...CYMBAL_CRASHER },
    { ...GLITCH_DJ },
    { ...SYNTH_OPERATOR },
    { ...TIMPANI_THUNDERER },
    { ...WAR_DRUMMER },
    { ...CIRCUIT_BENDER },
    { ...FORTISSIMO },
    { ...FORTISSIMO },
    { ...POWER_AMP },
    { ...POWER_AMP },
    { ...FEEDBACK_LOOP },
    { ...THE_DIVE_BAR },
    { ...THE_DIVE_BAR },
    { ...SNARE_STRIKER },
    { ...CYMBAL_CRASHER },
    { ...GLITCH_DJ },
    { ...SYNTH_OPERATOR },
    { ...BASS_DROP },
    { ...WAR_DRUMMER },
    { ...CIRCUIT_BENDER },
  ];
}

/**
 * Tutorial AI deck — fixed order (skipShuffle=true).
 * Designed so AI deploys well and doesn't die immediately.
 */
export function createTutorialAIDeck(): Card[] {
  return [
    // Starting hand (5)
    { ...CHOIR_INITIATE },      // Cost 1 — expendable for soundcheck
    { ...UKULELE_STRUMMER },    // Cost 1 — cheap deploy
    { ...VIOLIN_VIRTUOSO },     // Cost 2 — sturdy deploy
    { ...BARITONE_BARD },       // Cost 2 — for turn 2
    { ...LULLABY },             // Cost 2 — song for turn 2

    // Draw Turn 2
    { ...CELLO_SAGE },          // Cost 3
    { ...WHAMMY_BAR },          // Cost 1

    // Draw Turn 3
    { ...ALTO_ENCHANTRESS },    // Cost 3
    { ...ENCORE },              // Cost 2

    // Fill to 30
    { ...UKULELE_STRUMMER },
    { ...CHOIR_INITIATE },
    { ...VIOLIN_VIRTUOSO },
    { ...BARITONE_BARD },
    { ...CELLO_SAGE },
    { ...HARP_WEAVER },
    { ...ALTO_ENCHANTRESS },
    { ...CRESCENDO },
    { ...CRESCENDO },
    { ...CRESCENDO },
    { ...ENCORE },
    { ...LULLABY },
    { ...LULLABY },
    { ...WHAMMY_BAR },
    { ...UKULELE_STRUMMER },
    { ...CHOIR_INITIATE },
    { ...VIOLIN_VIRTUOSO },
    { ...BARITONE_BARD },
    { ...CELLO_SAGE },
    { ...HARP_WEAVER },
    { ...ALTO_ENCHANTRESS },
  ];
}
