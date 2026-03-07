/** Audio engine — AudioContext lifecycle, master bus, reverb, tempo clock */

const BPM = 100;
const BEATS_PER_LOOP = 16;
const BEAT_DURATION = 60 / BPM;

export interface AudioEngine {
  readonly ctx: AudioContext;
  readonly masterGain: GainNode;
  readonly reverbSend: GainNode;
  resume(): Promise<void>;
  suspend(): Promise<void>;
  setMuted(muted: boolean): void;
  isMuted(): boolean;
  nextBeatTime(): number;
  getCurrentBeat(): number;
  dispose(): void;
}

/** Create a procedural impulse response (decaying white noise) */
function createReverbImpulse(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 1.5;
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 4);
    }
  }

  return buffer;
}

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let reverbSendNode: GainNode | null = null;
  let muted = false;
  let startTime = 0;

  function ensureContext(): { ctx: AudioContext; masterGain: GainNode; reverbSend: GainNode } {
    if (ctx && masterGain && reverbSendNode) {
      return { ctx, masterGain, reverbSend: reverbSendNode };
    }

    ctx = new AudioContext();
    startTime = ctx.currentTime;

    // Master bus: [sources] → masterGain → compressor → destination
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Reverb send bus
    const convolver = ctx.createConvolver();
    convolver.buffer = createReverbImpulse(ctx);

    reverbSendNode = ctx.createGain();
    reverbSendNode.gain.value = 0.3;

    const reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 1;

    // Routing
    masterGain.connect(compressor);
    reverbSendNode.connect(convolver);
    convolver.connect(reverbReturn);
    reverbReturn.connect(compressor);
    compressor.connect(ctx.destination);

    return { ctx, masterGain, reverbSend: reverbSendNode };
  }

  const engine: AudioEngine = {
    get ctx(): AudioContext {
      return ensureContext().ctx;
    },
    get masterGain(): GainNode {
      return ensureContext().masterGain;
    },
    get reverbSend(): GainNode {
      return ensureContext().reverbSend;
    },

    async resume(): Promise<void> {
      const { ctx: c } = ensureContext();
      if (c.state === "suspended") {
        await c.resume();
        startTime = c.currentTime;
      }
    },

    async suspend(): Promise<void> {
      if (ctx && ctx.state === "running") {
        await ctx.suspend();
      }
    },

    setMuted(m: boolean): void {
      muted = m;
      if (masterGain && ctx) {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(m ? 0 : 1, now + 0.05);
      }
    },

    isMuted(): boolean {
      return muted;
    },

    nextBeatTime(): number {
      if (!ctx) return 0;
      const elapsed = ctx.currentTime - startTime;
      const currentBeatFrac = elapsed / BEAT_DURATION;
      const nextBeat = Math.ceil(currentBeatFrac);
      return startTime + nextBeat * BEAT_DURATION;
    },

    getCurrentBeat(): number {
      if (!ctx) return 0;
      const elapsed = ctx.currentTime - startTime;
      return Math.floor(elapsed / BEAT_DURATION) % BEATS_PER_LOOP;
    },

    dispose(): void {
      if (ctx) {
        ctx.close();
        ctx = null;
        masterGain = null;
        reverbSendNode = null;
      }
    },
  };

  return engine;
}

export { BPM, BEATS_PER_LOOP, BEAT_DURATION };
