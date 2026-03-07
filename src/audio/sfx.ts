/** One-shot sound effects — all pure synthesis, no samples */

import type { Faction } from "../types/cards";
import type { AudioEngine } from "./engine";
import { midiToFreq } from "./synths";

export interface SFXPlayer {
  playSoundcheckTap(): void;
  playDeploy(faction: Faction): void;
  playCombatHit(): void;
  playKO(): void;
  playChordFormation(type: "minor" | "power"): void;
  playResonanceDrain(): void;
  playPhaseTransition(): void;
  playWin(): void;
  playLose(): void;
}

/** Faction-representative MIDI notes for deploy arpeggios */
const FACTION_DEPLOY_NOTES: Record<Faction, [number, number, number]> = {
  winds: [69, 72, 76],     // A4 C5 E5
  percussion: [45, 48, 52], // A2 C3 E3
  strings: [57, 60, 64],   // A3 C4 E4
  electronic: [69, 74, 76], // A4 D5 E5
  voice: [57, 64, 67],     // A3 E4 G4
};

export function createSFXPlayer(engine: AudioEngine): SFXPlayer {
  const ctx = engine.ctx;
  const dest = engine.masterGain;

  /** Quick sine blip */
  function sineBlip(freq: number, time: number, duration: number, vol: number): void {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + duration + 0.01);
  }

  /** Noise burst */
  function noiseBurst(time: number, duration: number, vol: number): void {
    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp((-i / bufferSize) * 3);
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = vol;

    src.connect(gain);
    gain.connect(dest);
    src.start(time);
    src.stop(time + duration);
  }

  return {
    playSoundcheckTap(): void {
      const now = ctx.currentTime;
      sineBlip(1000, now, 0.01, 0.15);
    },

    playDeploy(faction: Faction): void {
      const now = ctx.currentTime;
      const notes = FACTION_DEPLOY_NOTES[faction];
      for (let i = 0; i < 3; i++) {
        sineBlip(midiToFreq(notes[i]), now + i * 0.08, 0.15, 0.2);
      }
    },

    playCombatHit(): void {
      const now = ctx.currentTime;
      // White noise burst + low thump
      noiseBurst(now, 0.03, 0.25);
      sineBlip(80, now, 0.05, 0.3);
    },

    playKO(): void {
      const now = ctx.currentTime;
      // Falling sine sweep
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.45);

      noiseBurst(now, 0.1, 0.15);
    },

    playChordFormation(type: "minor" | "power"): void {
      const now = ctx.currentTime;
      if (type === "minor") {
        // 2 simultaneous notes with swell
        sineBlip(midiToFreq(57), now, 0.3, 0.15); // A3
        sineBlip(midiToFreq(60), now, 0.3, 0.15); // C4
      } else {
        // 3-note triad with longer swell
        sineBlip(midiToFreq(57), now, 0.5, 0.2); // A3
        sineBlip(midiToFreq(60), now, 0.5, 0.2); // C4
        sineBlip(midiToFreq(64), now, 0.5, 0.2); // E4
      }
    },

    playResonanceDrain(): void {
      const now = ctx.currentTime;
      sineBlip(60, now, 0.2, 0.2);
    },

    playPhaseTransition(): void {
      const now = ctx.currentTime;
      sineBlip(4000, now, 0.005, 0.1);
    },

    playWin(): void {
      const now = ctx.currentTime;
      // Ascending major arpeggio: A C# E A
      const notes = [69, 73, 76, 81]; // A4 C#5 E5 A5
      for (let i = 0; i < notes.length; i++) {
        sineBlip(midiToFreq(notes[i]), now + i * 0.15, 0.4, 0.15 + i * 0.05);
      }
    },

    playLose(): void {
      const now = ctx.currentTime;
      // Descending minor arpeggio: A G E C
      const notes = [69, 67, 64, 60]; // A4 G4 E4 C4
      for (let i = 0; i < notes.length; i++) {
        sineBlip(midiToFreq(notes[i]), now + i * 0.15, 0.4, 0.2 - i * 0.03);
      }
    },
  };
}
