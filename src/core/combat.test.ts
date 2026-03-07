import { describe, it, expect, beforeEach } from "vitest";
import {
  isZoneBlocked,
  getValidTargets,
  resolveAllStrikes,
} from "./combat";
import {
  createTestState,
  createDeployedMusician,
  resetTestIds,
} from "./test-helpers";

describe("combat", () => {
  beforeEach(() => resetTestIds());

  describe("isZoneBlocked", () => {
    it("front-row is never blocked", () => {
      const stage = [createDeployedMusician("front-row")];
      expect(isZoneBlocked("front-row", stage)).toBe(false);
    });

    it("mid-stage is blocked when front-row has defenders", () => {
      const stage = [createDeployedMusician("front-row")];
      expect(isZoneBlocked("mid-stage", stage)).toBe(true);
    });

    it("mid-stage is open when no front-row defenders", () => {
      const stage = [createDeployedMusician("back-line")];
      expect(isZoneBlocked("mid-stage", stage)).toBe(false);
    });

    it("back-line is blocked by front-row", () => {
      const stage = [createDeployedMusician("front-row")];
      expect(isZoneBlocked("back-line", stage)).toBe(true);
    });

    it("back-line is blocked by mid-stage", () => {
      const stage = [createDeployedMusician("mid-stage")];
      expect(isZoneBlocked("back-line", stage)).toBe(true);
    });
  });

  describe("getValidTargets", () => {
    it("melee can only hit front-row when occupied", () => {
      const stage = [
        createDeployedMusician("front-row"),
        createDeployedMusician("mid-stage"),
      ];
      const targets = getValidTargets("front-row", "melee", stage);
      expect(targets).toEqual([0]);
    });

    it("melee can hit mid-stage when front-row empty", () => {
      const stage = [createDeployedMusician("mid-stage")];
      const targets = getValidTargets("front-row", "melee", stage);
      expect(targets).toEqual([0]);
    });

    it("sniper can hit any unblocked zone", () => {
      const stage = [
        createDeployedMusician("front-row"),
        createDeployedMusician("back-line"),
      ];
      const targets = getValidTargets("back-line", "sniper", stage);
      // front-row is valid, back-line is blocked by front-row
      expect(targets).toEqual([0]);
    });

    it("sniper can hit back-line when no blockers", () => {
      const stage = [createDeployedMusician("back-line")];
      const targets = getValidTargets("back-line", "sniper", stage);
      expect(targets).toEqual([0]);
    });
  });

  describe("resolveAllStrikes", () => {
    it("applies mutual damage simultaneously", () => {
      const state = createTestState();
      state.players[0].stage = [
        createDeployedMusician("front-row", { volume: 3, tone: 5 }),
      ];
      state.players[1].stage = [
        createDeployedMusician("front-row", { volume: 2, tone: 4 }),
      ];

      const result = resolveAllStrikes(state, 0, [
        { attackerIndex: 0, targetIndex: 0 },
      ]);

      // Attacker takes 2 damage (defender's volume), defender takes 3 (attacker's volume)
      expect(result.players[0].stage[0].currentTone).toBe(3); // 5 - 2
      expect(result.players[1].stage[0].currentTone).toBe(1); // 4 - 3
    });

    it("KO'd musicians move to discard", () => {
      const state = createTestState();
      state.players[0].stage = [
        createDeployedMusician("front-row", { volume: 5, tone: 5 }),
      ];
      state.players[1].stage = [
        createDeployedMusician("front-row", { volume: 1, tone: 2 }),
      ];

      const result = resolveAllStrikes(state, 0, [
        { attackerIndex: 0, targetIndex: 0 },
      ]);

      // Defender KO'd (tone 2 - 5 < 0)
      expect(result.players[1].stage).toHaveLength(0);
      expect(result.players[1].discard).toHaveLength(1);
    });

    it("tracks damage in lastRoundDamage", () => {
      const state = createTestState();
      state.players[0].stage = [
        createDeployedMusician("front-row", { volume: 3, tone: 5 }),
      ];
      state.players[1].stage = [
        createDeployedMusician("front-row", { volume: 2, tone: 5 }),
      ];

      const result = resolveAllStrikes(state, 0, [
        { attackerIndex: 0, targetIndex: 0 },
      ]);

      expect(result.lastRoundDamage[0]).toBe(3);
    });
  });
});
