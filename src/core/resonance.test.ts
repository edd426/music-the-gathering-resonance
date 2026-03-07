import { describe, it, expect, beforeEach } from "vitest";
import { calculateResonance, applyResonance } from "./resonance";
import {
  createTestState,
  createDeployedMusician,
  resetTestIds,
} from "./test-helpers";

describe("resonance", () => {
  beforeEach(() => resetTestIds());

  describe("calculateResonance", () => {
    it("sums Back Line musicians' resonance", () => {
      const stage = [
        createDeployedMusician("back-line", { resonance: 2 }),
        createDeployedMusician("back-line", { resonance: 1 }),
      ];
      expect(calculateResonance(stage)).toBe(3);
    });

    it("ignores non-Back Line musicians", () => {
      const stage = [
        createDeployedMusician("front-row", { resonance: 5 }),
        createDeployedMusician("mid-stage", { resonance: 3 }),
      ];
      expect(calculateResonance(stage)).toBe(0);
    });

    it("ignores discordant musicians", () => {
      const m = createDeployedMusician("back-line", { resonance: 3 });
      m.discordantTurnsRemaining = 1;
      expect(calculateResonance([m])).toBe(0);
    });
  });

  describe("applyResonance", () => {
    it("drains opponent harmony", () => {
      const state = createTestState({ activePlayerIndex: 0 });
      state.players[0].stage = [
        createDeployedMusician("back-line", { resonance: 3 }),
      ];
      const result = applyResonance(state);
      expect(result.players[1].harmony).toBe(17); // 20 - 3
    });

    it("floors harmony at 0", () => {
      const state = createTestState({ activePlayerIndex: 0 });
      state.players[0].stage = [
        createDeployedMusician("back-line", { resonance: 5 }),
      ];
      state.players[1].harmony = 3;
      const result = applyResonance(state);
      expect(result.players[1].harmony).toBe(0);
    });

    it("does nothing with no Back Line musicians", () => {
      const state = createTestState({ activePlayerIndex: 0 });
      state.players[0].stage = [
        createDeployedMusician("front-row", { resonance: 5 }),
      ];
      const result = applyResonance(state);
      expect(result.players[1].harmony).toBe(20);
    });

    it("tracks damage in lastRoundDamage", () => {
      const state = createTestState({ activePlayerIndex: 0 });
      state.players[0].stage = [
        createDeployedMusician("back-line", { resonance: 2 }),
      ];
      const result = applyResonance(state);
      expect(result.lastRoundDamage[0]).toBe(2);
    });
  });
});
