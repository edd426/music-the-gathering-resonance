import { describe, it, expect, beforeEach } from "vitest";
import {
  detectChords,
  computeChordBonuses,
  computeEnsembleBonus,
  getEffectiveResonance,
  applyDiscordantOnChordBreak,
} from "./chords";
import {
  createTestState,
  createDeployedMusician,
  resetTestIds,
} from "./test-helpers";

describe("chords", () => {
  beforeEach(() => resetTestIds());

  describe("detectChords", () => {
    it("detects Minor Chord (2 adjacent same-faction)", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "strings" }),
        createDeployedMusician("mid-stage", { faction: "strings" }),
      ];
      const chords = detectChords(stage);
      expect(chords).toHaveLength(1);
      expect(chords[0].type).toBe("minor");
      expect(chords[0].faction).toBe("strings");
    });

    it("does NOT detect chord for non-adjacent zones", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "strings" }),
        createDeployedMusician("back-line", { faction: "strings" }),
      ];
      const chords = detectChords(stage);
      expect(chords).toHaveLength(0);
    });

    it("detects Power Chord (3 same-faction in all zones)", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "winds" }),
        createDeployedMusician("mid-stage", { faction: "winds" }),
        createDeployedMusician("back-line", { faction: "winds" }),
      ];
      const chords = detectChords(stage);
      expect(chords).toHaveLength(1);
      expect(chords[0].type).toBe("power");
    });

    it("returns empty for mixed factions", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "strings" }),
        createDeployedMusician("mid-stage", { faction: "winds" }),
      ];
      expect(detectChords(stage)).toHaveLength(0);
    });
  });

  describe("computeChordBonuses", () => {
    it("gives +1 vol/+1 res for Minor Chord", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "strings" }),
        createDeployedMusician("mid-stage", { faction: "strings" }),
      ];
      const bonuses = computeChordBonuses(stage);
      expect(bonuses.get(0)).toEqual({ volume: 1, resonance: 1 });
      expect(bonuses.get(1)).toEqual({ volume: 1, resonance: 1 });
    });

    it("gives +2 vol/+2 res for Power Chord", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "winds" }),
        createDeployedMusician("mid-stage", { faction: "winds" }),
        createDeployedMusician("back-line", { faction: "winds" }),
      ];
      const bonuses = computeChordBonuses(stage);
      expect(bonuses.get(0)?.volume).toBe(2);
      expect(bonuses.get(0)?.resonance).toBe(2);
    });
  });

  describe("computeEnsembleBonus", () => {
    it("grants bonus for mid-stage with same-faction in both flanks", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "strings" }),
        createDeployedMusician("mid-stage", { faction: "strings" }),
        createDeployedMusician("back-line", { faction: "strings" }),
      ];
      const bonus = computeEnsembleBonus(stage, 1);
      expect(bonus).toEqual({ volume: 1, tone: 1 });
    });

    it("no bonus if not in mid-stage", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "strings" }),
        createDeployedMusician("mid-stage", { faction: "strings" }),
        createDeployedMusician("back-line", { faction: "strings" }),
      ];
      expect(computeEnsembleBonus(stage, 0)).toEqual({
        volume: 0,
        tone: 0,
      });
    });

    it("no bonus if missing one flank", () => {
      const stage = [
        createDeployedMusician("front-row", { faction: "strings" }),
        createDeployedMusician("mid-stage", { faction: "strings" }),
      ];
      expect(computeEnsembleBonus(stage, 1)).toEqual({
        volume: 0,
        tone: 0,
      });
    });
  });

  describe("getEffectiveResonance", () => {
    it("returns 0 when discordant", () => {
      const stage = [
        createDeployedMusician("back-line", { resonance: 3 }),
      ];
      stage[0].discordantTurnsRemaining = 1;
      expect(getEffectiveResonance(stage, 0)).toBe(0);
    });

    it("includes chord bonuses", () => {
      const stage = [
        createDeployedMusician("front-row", {
          faction: "strings",
          resonance: 1,
        }),
        createDeployedMusician("mid-stage", {
          faction: "strings",
          resonance: 2,
        }),
      ];
      // Minor chord: +1 resonance
      expect(getEffectiveResonance(stage, 1)).toBe(3);
    });
  });

  describe("applyDiscordantOnChordBreak", () => {
    it("marks remaining chord members as discordant", () => {
      const state = createTestState();
      state.players[0].stage = [
        createDeployedMusician("front-row", { faction: "strings" }),
        createDeployedMusician("mid-stage", { faction: "strings" }),
        createDeployedMusician("back-line", { faction: "percussion" }),
      ];
      // Remove index 0 (breaks Minor Chord of strings at 0,1)
      const result = applyDiscordantOnChordBreak(state, 0, 0);
      expect(
        result.players[0].stage[1].discordantTurnsRemaining
      ).toBe(1);
      // Percussion musician should not be affected
      expect(
        result.players[0].stage[2].discordantTurnsRemaining
      ).toBe(0);
    });
  });
});
