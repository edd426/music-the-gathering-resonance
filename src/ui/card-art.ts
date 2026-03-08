/** Map card IDs to their art image paths in public/cards/ */

const CARD_ART: Record<string, string> = {
  // Winds
  "mus-winds-01": "cards/piccolo-piper.jpg",
  "mus-winds-02": "cards/clarinet-sentinel.jpg",
  "mus-winds-03": "cards/trumpet-herald.jpg",
  "mus-winds-04": "cards/tuba-bastion.jpg",
  // Percussion
  "mus-perc-01": "cards/snare-striker.jpg",
  "mus-perc-02": "cards/cymbal-crasher.jpg",
  "mus-perc-03": "cards/timpani-thunderer.jpg",
  "mus-perc-04": "cards/war-drummer.jpg",
  // Strings
  "mus-str-01": "cards/ukulele-strummer.jpg",
  "mus-str-02": "cards/violin-virtuoso.jpg",
  "mus-str-03": "cards/cello-sage.jpg",
  "mus-str-04": "cards/harp-weaver.jpg",
  // Electronic
  "mus-elec-01": "cards/glitch-dj.jpg",
  "mus-elec-02": "cards/synth-operator.jpg",
  "mus-elec-03": "cards/bass-drop.jpg",
  "mus-elec-04": "cards/circuit-bender.jpg",
  // Voice
  "mus-voice-01": "cards/choir-initiate.jpg",
  "mus-voice-02": "cards/baritone-bard.jpg",
  "mus-voice-03": "cards/alto-enchantress.jpg",
  "mus-voice-04": "cards/opera-diva.jpg",
  // Songs
  "song-crescendo": "cards/crescendo.jpg",
  "song-fortissimo": "cards/fortissimo.jpg",
  "song-lullaby": "cards/lullaby.jpg",
  "song-encore": "cards/encore.jpg",
  // Riffs
  "riff-whammy-bar": "cards/whammy-bar.jpg",
  "riff-feedback-loop": "cards/feedback-loop.jpg",
  "riff-power-amp": "cards/power-amp.jpg",
  // Venues
  "venue-dive-bar": "cards/dive-bar.jpg",
  "venue-grand-amphitheater": "cards/grand-amphitheater.jpg",
};

export function getCardArtPath(cardId: string): string | null {
  const path = CARD_ART[cardId];
  if (!path) return null;
  return `${import.meta.env.BASE_URL}${path}`;
}
