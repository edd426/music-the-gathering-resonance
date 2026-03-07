import { describe, it, expect, beforeEach } from "vitest";
import { deployMusician, canDeploy } from "./deploy";
import {
  createTestState,
  createTestMusician,
  createTestCard,
  resetTestIds,
} from "./test-helpers";

describe("deploy", () => {
  beforeEach(() => resetTestIds());

  describe("deployMusician", () => {
    it("moves musician from hand to stage", () => {
      const musician = createTestMusician({ cost: 1 });
      const state = createTestState();
      state.players[0].hand = [musician];
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: false },
      ];

      const result = deployMusician(state, 0, 0, "front-row");
      expect(result.players[0].hand).toHaveLength(0);
      expect(result.players[0].stage).toHaveLength(1);
      expect(result.players[0].stage[0].zone).toBe("front-row");
      expect(result.players[0].stage[0].currentTone).toBe(musician.tone);
    });

    it("decrements deploysRemaining", () => {
      const state = createTestState({ deploysRemaining: 2 });
      state.players[0].hand = [createTestMusician({ cost: 0 })];
      const result = deployMusician(state, 0, 0, "mid-stage");
      expect(result.deploysRemaining).toBe(1);
    });

    it("increments totalDeploys", () => {
      const state = createTestState();
      state.players[0].hand = [createTestMusician({ cost: 0 })];
      const result = deployMusician(state, 0, 0, "front-row");
      expect(result.totalDeploys[0]).toBe(1);
    });

    it("throws for non-musician card", () => {
      const state = createTestState();
      state.players[0].hand = [
        {
          id: "s1",
          name: "Song",
          type: "song" as const,
          cost: 1,
          faction: "strings" as const,
          description: "test",
          effect: "test",
        },
      ];
      expect(() => deployMusician(state, 0, 0, "front-row")).toThrow(
        "Not a Musician card"
      );
    });

    it("throws when deploy limit reached", () => {
      const state = createTestState({ deploysRemaining: 0 });
      state.players[0].hand = [createTestMusician({ cost: 0 })];
      expect(() => deployMusician(state, 0, 0, "front-row")).toThrow(
        "No deploys remaining"
      );
    });

    it("throws with insufficient resources", () => {
      const state = createTestState();
      state.players[0].hand = [createTestMusician({ cost: 3 })];
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: false },
      ];
      expect(() => deployMusician(state, 0, 0, "front-row")).toThrow(
        "Insufficient resources"
      );
    });
  });

  describe("canDeploy", () => {
    it("returns true when valid", () => {
      const state = createTestState();
      state.players[0].hand = [createTestMusician({ cost: 1 })];
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: false },
      ];
      expect(canDeploy(state, 0, 0)).toBe(true);
    });

    it("returns false when no deploys remaining", () => {
      const state = createTestState({ deploysRemaining: 0 });
      state.players[0].hand = [createTestMusician({ cost: 0 })];
      expect(canDeploy(state, 0, 0)).toBe(false);
    });
  });
});
