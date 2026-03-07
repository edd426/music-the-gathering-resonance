/** Looping melodic patterns per faction with lookahead scheduler */

import type { Faction } from "../types/cards";
import type { AudioEngine } from "./engine";
import { BEAT_DURATION, BEATS_PER_LOOP } from "./engine";
import { createFactionVoice, midiToFreq } from "./synths";
import type { FactionVoice } from "./synths";

interface NoteEvent {
  beat: number;
  midi: number;
  duration: number; // in beats
  velocity: number;
}

// A minor pentatonic: A C D E G
// MIDI: A2=45, C3=48, D3=50, E3=52, G3=55, A3=57, C4=60, D4=62, E4=64, G4=67, A4=69, C5=72, D5=74, E5=76

const STEM_PATTERNS: Record<Faction, NoteEvent[]> = {
  // Winds: long sustained melody (A4-D5 register, sparse)
  winds: [
    { beat: 0, midi: 69, duration: 3, velocity: 0.7 },
    { beat: 3, midi: 72, duration: 2.5, velocity: 0.6 },
    { beat: 6, midi: 74, duration: 3, velocity: 0.8 },
    { beat: 10, midi: 72, duration: 2, velocity: 0.5 },
    { beat: 12, midi: 69, duration: 2.5, velocity: 0.7 },
    { beat: 14.5, midi: 67, duration: 1.5, velocity: 0.6 },
  ],

  // Percussion: steady rhythmic pulse (A2-G3 register, dense)
  percussion: [
    { beat: 0, midi: 45, duration: 0.3, velocity: 0.9 },
    { beat: 1, midi: 48, duration: 0.2, velocity: 0.5 },
    { beat: 2, midi: 45, duration: 0.3, velocity: 0.8 },
    { beat: 3, midi: 50, duration: 0.2, velocity: 0.6 },
    { beat: 4, midi: 45, duration: 0.3, velocity: 0.9 },
    { beat: 5, midi: 48, duration: 0.2, velocity: 0.5 },
    { beat: 6, midi: 52, duration: 0.3, velocity: 0.7 },
    { beat: 7, midi: 48, duration: 0.2, velocity: 0.5 },
    { beat: 8, midi: 45, duration: 0.3, velocity: 0.9 },
    { beat: 9, midi: 50, duration: 0.2, velocity: 0.6 },
    { beat: 10, midi: 45, duration: 0.3, velocity: 0.8 },
    { beat: 11, midi: 55, duration: 0.2, velocity: 0.5 },
    { beat: 12, midi: 45, duration: 0.3, velocity: 0.9 },
    { beat: 13, midi: 48, duration: 0.2, velocity: 0.6 },
    { beat: 14, midi: 52, duration: 0.3, velocity: 0.7 },
    { beat: 15, midi: 50, duration: 0.2, velocity: 0.5 },
  ],

  // Strings: rising/falling arpeggios (A3-A4 register, moderate)
  strings: [
    { beat: 0, midi: 57, duration: 1.2, velocity: 0.7 },
    { beat: 1.5, midi: 60, duration: 1.2, velocity: 0.6 },
    { beat: 3, midi: 62, duration: 1.2, velocity: 0.7 },
    { beat: 4.5, midi: 64, duration: 1.2, velocity: 0.8 },
    { beat: 6, midi: 67, duration: 1.5, velocity: 0.7 },
    { beat: 7.5, midi: 69, duration: 1.5, velocity: 0.6 },
    { beat: 9, midi: 67, duration: 1.2, velocity: 0.7 },
    { beat: 10.5, midi: 64, duration: 1.2, velocity: 0.6 },
    { beat: 12, midi: 62, duration: 1.2, velocity: 0.7 },
    { beat: 13, midi: 60, duration: 1.2, velocity: 0.6 },
    { beat: 14, midi: 57, duration: 1.2, velocity: 0.7 },
    { beat: 15, midi: 60, duration: 1, velocity: 0.5 },
    { beat: 15.5, midi: 62, duration: 0.5, velocity: 0.5 },
  ],

  // Electronic: syncopated off-beats (A4-E5 register, moderate-dense)
  electronic: [
    { beat: 0.5, midi: 69, duration: 0.4, velocity: 0.8 },
    { beat: 1.5, midi: 72, duration: 0.3, velocity: 0.6 },
    { beat: 2, midi: 69, duration: 0.4, velocity: 0.7 },
    { beat: 3.5, midi: 74, duration: 0.3, velocity: 0.8 },
    { beat: 4.5, midi: 76, duration: 0.4, velocity: 0.7 },
    { beat: 5, midi: 74, duration: 0.3, velocity: 0.6 },
    { beat: 6.5, midi: 72, duration: 0.4, velocity: 0.8 },
    { beat: 7.5, midi: 69, duration: 0.3, velocity: 0.6 },
    { beat: 8.5, midi: 72, duration: 0.4, velocity: 0.7 },
    { beat: 9, midi: 74, duration: 0.3, velocity: 0.8 },
    { beat: 10.5, midi: 76, duration: 0.4, velocity: 0.7 },
    { beat: 12, midi: 72, duration: 0.3, velocity: 0.6 },
    { beat: 13.5, midi: 69, duration: 0.4, velocity: 0.8 },
    { beat: 15, midi: 74, duration: 0.3, velocity: 0.7 },
  ],

  // Voice: slow wide intervals, haunting (A3-G4 register, very sparse)
  voice: [
    { beat: 0, midi: 57, duration: 4, velocity: 0.7 },
    { beat: 4, midi: 64, duration: 3.5, velocity: 0.6 },
    { beat: 8, midi: 67, duration: 3, velocity: 0.8 },
    { beat: 12, midi: 62, duration: 2.5, velocity: 0.6 },
    { beat: 15, midi: 57, duration: 1, velocity: 0.5 },
  ],
};

export interface StemPlayer {
  start(): void;
  stop(): void;
  setGain(value: number): void;
  setReverbSend(value: number): void;
  setDetune(cents: number): void;
  setFilterCutoff(freq: number): void;
  isPlaying(): boolean;
}

export function createStemPlayer(
  faction: Faction,
  engine: AudioEngine
): StemPlayer {
  const ctx = engine.ctx;
  const pattern = STEM_PATTERNS[faction];

  // Per-stem output chain: [voice] → stemGain → filter → masterGain
  //                                        └→ reverbSendGain → engine.reverbSend
  const stemGain = ctx.createGain();
  stemGain.gain.value = 0.6;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 20000;

  const reverbSendGain = ctx.createGain();
  reverbSendGain.gain.value = 0.1;

  stemGain.connect(filter);
  filter.connect(engine.masterGain);
  stemGain.connect(reverbSendGain);
  reverbSendGain.connect(engine.reverbSend);

  let voice: FactionVoice = createFactionVoice(faction, ctx, stemGain);
  let schedulerInterval: ReturnType<typeof setInterval> | null = null;
  let playing = false;
  let lastScheduledBeat = -1;

  const LOOKAHEAD_MS = 25;
  const SCHEDULE_AHEAD_S = 0.1;

  function getLoopStartTime(): number {
    // Align to the start of the current 16-beat loop
    const elapsed = ctx.currentTime;
    const loopDuration = BEATS_PER_LOOP * BEAT_DURATION;
    const loopIndex = Math.floor(elapsed / loopDuration);
    return loopIndex * loopDuration;
  }

  function scheduleNotes(): void {
    const now = ctx.currentTime;
    const scheduleUntil = now + SCHEDULE_AHEAD_S;
    const loopDuration = BEATS_PER_LOOP * BEAT_DURATION;

    for (const note of pattern) {
      // Calculate the absolute time for this note in the current and next loop
      const loopStart = getLoopStartTime();

      for (let offset = 0; offset <= 1; offset++) {
        const noteTime = loopStart + offset * loopDuration + note.beat * BEAT_DURATION;

        if (noteTime >= now && noteTime < scheduleUntil) {
          // Use a simple beat identifier to avoid double-scheduling
          const beatId = Math.round(noteTime * 1000);
          if (beatId !== lastScheduledBeat) {
            lastScheduledBeat = beatId;
            const freq = midiToFreq(note.midi);
            const dur = note.duration * BEAT_DURATION;
            voice.playNote(freq, noteTime, dur, note.velocity);
          }
        }
      }
    }
  }

  return {
    start(): void {
      if (playing) return;
      playing = true;
      lastScheduledBeat = -1;
      // Recreate voice in case context changed
      voice = createFactionVoice(faction, ctx, stemGain);
      schedulerInterval = setInterval(scheduleNotes, LOOKAHEAD_MS);
    },

    stop(): void {
      if (!playing) return;
      playing = false;
      if (schedulerInterval !== null) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
      }
      // Fade out
      const now = ctx.currentTime;
      stemGain.gain.cancelScheduledValues(now);
      stemGain.gain.setValueAtTime(stemGain.gain.value, now);
      stemGain.gain.linearRampToValueAtTime(0, now + 0.5);
    },

    setGain(value: number): void {
      const now = ctx.currentTime;
      stemGain.gain.cancelScheduledValues(now);
      stemGain.gain.setValueAtTime(stemGain.gain.value, now);
      stemGain.gain.linearRampToValueAtTime(Math.min(value, 1), now + 0.1);
    },

    setReverbSend(value: number): void {
      reverbSendGain.gain.value = value;
    },

    setFilterCutoff(freq: number): void {
      filter.frequency.value = Math.max(200, Math.min(freq, 20000));
    },

    setDetune(cents: number): void {
      // Apply detune to the filter frequency as a proxy (shifts timbre)
      // Real detune would require re-creating oscillators, so we shift filter instead
      const baseFreq = filter.frequency.value;
      const shifted = baseFreq * Math.pow(2, cents / 1200);
      filter.frequency.value = Math.max(200, Math.min(shifted, 20000));
    },

    isPlaying(): boolean {
      return playing;
    },
  };
}
