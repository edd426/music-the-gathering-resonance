/** Faction-specific synthesizer voice factories */

import type { Faction } from "../types/cards";

export interface FactionVoice {
  playNote(freq: number, startTime: number, duration: number, velocity: number): void;
}

/** MIDI note number to frequency */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function createWindsVoice(ctx: AudioContext, dest: AudioNode): FactionVoice {
  return {
    playNote(freq, startTime, duration, velocity) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;

      // Vibrato LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5;
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Bandpass + lowpass
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 800;
      bp.Q.value = 2;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 3000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(velocity * 0.3, startTime + 0.15);
      gain.gain.setValueAtTime(velocity * 0.3 * 0.8, startTime + duration - 0.4);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(bp);
      bp.connect(lp);
      lp.connect(gain);
      gain.connect(dest);

      lfo.start(startTime);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
      lfo.stop(startTime + duration + 0.1);
    },
  };
}

function createPercussionVoice(ctx: AudioContext, dest: AudioNode): FactionVoice {
  return {
    playNote(freq, startTime, _duration, velocity) {
      // Body: sine with pitch sweep
      const body = ctx.createOscillator();
      body.type = "sine";
      body.frequency.setValueAtTime(freq * 2.5, startTime);
      body.frequency.exponentialRampToValueAtTime(freq, startTime + 0.08);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(velocity * 0.4, startTime);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      body.connect(bodyGain);
      bodyGain.connect(dest);

      // Noise transient
      const bufferSize = ctx.sampleRate * 0.05;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 2000;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(velocity * 0.15, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

      noise.connect(hp);
      hp.connect(noiseGain);
      noiseGain.connect(dest);

      body.start(startTime);
      body.stop(startTime + 0.2);
      noise.start(startTime);
      noise.stop(startTime + 0.06);
    },
  };
}

function createStringsVoice(ctx: AudioContext, dest: AudioNode): FactionVoice {
  return {
    playNote(freq, startTime, duration, velocity) {
      // Two detuned sawtooths
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc2.type = "sawtooth";
      osc1.frequency.value = freq;
      osc2.frequency.value = freq;
      osc1.detune.value = 7;
      osc2.detune.value = -7;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2500;

      // Tremolo
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 3;
      lfoGain.gain.value = 0.1;
      lfo.connect(lfoGain);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(velocity * 0.2, startTime + 0.3);
      gain.gain.setValueAtTime(velocity * 0.2 * 0.7, startTime + duration - 0.5);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      lfoGain.connect(gain.gain);

      osc1.connect(lp);
      osc2.connect(lp);
      lp.connect(gain);
      gain.connect(dest);

      lfo.start(startTime);
      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.1);
      osc2.stop(startTime + duration + 0.1);
      lfo.stop(startTime + duration + 0.1);
    },
  };
}

function createElectronicVoice(ctx: AudioContext, dest: AudioNode): FactionVoice {
  return {
    playNote(freq, startTime, duration, velocity) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;

      // Waveshaper distortion
      const shaper = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i / 128) - 1;
        curve[i] = Math.tanh(x * 2);
      }
      shaper.curve = curve;

      // Bandpass with LFO sweep
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2000;
      bp.Q.value = 3;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.5;
      lfoGain.gain.value = 1800;
      lfo.connect(lfoGain);
      lfoGain.connect(bp.frequency);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(velocity * 0.2, startTime + 0.01);
      gain.gain.setValueAtTime(velocity * 0.2, startTime + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(shaper);
      shaper.connect(bp);
      bp.connect(gain);
      gain.connect(dest);

      lfo.start(startTime);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
      lfo.stop(startTime + duration + 0.1);
    },
  };
}

function createVocalVoice(ctx: AudioContext, dest: AudioNode): FactionVoice {
  return {
    playNote(freq, startTime, duration, velocity) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;

      // Vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5.5;
      lfoGain.gain.value = 4;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // 3 parallel formant bandpass filters
      const formants = [
        { freq: 700, Q: 5, gain: 1.0 },
        { freq: 1200, Q: 8, gain: 0.7 },
        { freq: 2600, Q: 10, gain: 0.5 },
      ];

      const merger = ctx.createGain();
      merger.gain.value = 1;

      for (const f of formants) {
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = f.freq;
        bp.Q.value = f.Q;

        const fGain = ctx.createGain();
        fGain.gain.value = f.gain;

        osc.connect(bp);
        bp.connect(fGain);
        fGain.connect(merger);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(velocity * 0.25, startTime + 0.2);
      gain.gain.setValueAtTime(velocity * 0.25 * 0.6, startTime + duration - 0.6);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      merger.connect(gain);
      gain.connect(dest);

      lfo.start(startTime);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
      lfo.stop(startTime + duration + 0.1);
    },
  };
}

export function createFactionVoice(
  faction: Faction,
  ctx: AudioContext,
  dest: AudioNode
): FactionVoice {
  switch (faction) {
    case "winds":
      return createWindsVoice(ctx, dest);
    case "percussion":
      return createPercussionVoice(ctx, dest);
    case "strings":
      return createStringsVoice(ctx, dest);
    case "electronic":
      return createElectronicVoice(ctx, dest);
    case "voice":
      return createVocalVoice(ctx, dest);
  }
}
