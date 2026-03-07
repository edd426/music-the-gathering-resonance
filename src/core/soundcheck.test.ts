import { describe, it, expect, beforeEach } from "vitest";
import {
  playSoundcheck,
  refreshSoundcheck,
  tapResources,
  getAvailableResources,
} from "./soundcheck";
import {
  createTestState,
  createTestCard,
  resetTestIds,
} from "./test-helpers";

describe("soundcheck", () => {
  beforeEach(() => resetTestIds());

  describe("playSoundcheck", () => {
    it("moves card from hand to soundcheck", () => {
      const state = createTestState();
      state.players[0].hand = [createTestCard(), createTestCard()];
      const result = playSoundcheck(state, 0, 0);
      expect(result.players[0].hand).toHaveLength(1);
      expect(result.players[0].soundcheck).toHaveLength(1);
      expect(result.players[0].soundcheck[0].tapped).toBe(false);
    });

    it("enforces 1-per-turn limit", () => {
      const state = createTestState();
      state.players[0].hand = [createTestCard(), createTestCard()];
      const result = playSoundcheck(state, 0, 0);
      expect(() => playSoundcheck(result, 0, 0)).toThrow(
        "Already played a Soundcheck this turn"
      );
    });

    it("marks soundcheckPlayedThisTurn", () => {
      const state = createTestState();
      state.players[0].hand = [createTestCard()];
      const result = playSoundcheck(state, 0, 0);
      expect(result.soundcheckPlayedThisTurn).toBe(true);
    });
  });

  describe("tapResources", () => {
    it("taps the requested number of resources", () => {
      const state = createTestState();
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: false },
        { card: createTestCard(), tapped: false },
        { card: createTestCard(), tapped: false },
      ];
      const result = tapResources(state, 0, 2);
      const tapped = result.players[0].soundcheck.filter((r) => r.tapped);
      expect(tapped).toHaveLength(2);
    });

    it("throws on insufficient resources", () => {
      const state = createTestState();
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: false },
      ];
      expect(() => tapResources(state, 0, 3)).toThrow("Insufficient resources");
    });
  });

  describe("refreshSoundcheck", () => {
    it("untaps all resources", () => {
      const state = createTestState();
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: true },
        { card: createTestCard(), tapped: true },
      ];
      const result = refreshSoundcheck(state, 0);
      expect(result.players[0].soundcheck.every((r) => !r.tapped)).toBe(true);
    });
  });

  describe("getAvailableResources", () => {
    it("counts untapped resources", () => {
      const player = {
        soundcheck: [
          { card: createTestCard(), tapped: false },
          { card: createTestCard(), tapped: true },
          { card: createTestCard(), tapped: false },
        ],
      };
      expect(getAvailableResources(player)).toBe(2);
    });
  });
});
