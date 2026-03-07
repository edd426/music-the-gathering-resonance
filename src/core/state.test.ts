import { describe, it, expect, beforeEach } from "vitest";
import {
  createInitialGameState,
  getActivePlayer,
  getOpponent,
  opponentIndex,
  updatePlayer,
  updateMusician,
} from "./state";
import { GAME_CONFIG } from "../types/game";
import {
  createTestState,
  createTestDeck,
  createDeployedMusician,
  resetTestIds,
  seededRng,
} from "./test-helpers";

describe("state", () => {
  beforeEach(() => resetTestIds());

  describe("createInitialGameState", () => {
    it("sets starting harmony for both players", () => {
      const state = createInitialGameState(
        "P1",
        createTestDeck(),
        "P2",
        createTestDeck(),
        seededRng(1)
      );
      expect(state.players[0].harmony).toBe(GAME_CONFIG.STARTING_HARMONY);
      expect(state.players[1].harmony).toBe(GAME_CONFIG.STARTING_HARMONY);
    });

    it("deals starting hands", () => {
      const state = createInitialGameState(
        "P1",
        createTestDeck(),
        "P2",
        createTestDeck(),
        seededRng(1)
      );
      expect(state.players[0].hand).toHaveLength(GAME_CONFIG.STARTING_HAND);
      expect(state.players[1].hand).toHaveLength(GAME_CONFIG.STARTING_HAND);
    });

    it("reduces deck size by starting hand", () => {
      const state = createInitialGameState(
        "P1",
        createTestDeck(),
        "P2",
        createTestDeck(),
        seededRng(1)
      );
      expect(state.players[0].deck).toHaveLength(
        GAME_CONFIG.DECK_SIZE - GAME_CONFIG.STARTING_HAND
      );
    });

    it("rejects wrong deck size", () => {
      expect(() =>
        createInitialGameState(
          "P1",
          createTestDeck(10),
          "P2",
          createTestDeck(),
          seededRng(1)
        )
      ).toThrow();
    });

    it("sets turn 1 and refresh phase", () => {
      const state = createInitialGameState(
        "P1",
        createTestDeck(),
        "P2",
        createTestDeck(),
        seededRng(1)
      );
      expect(state.turnNumber).toBe(1);
      expect(state.currentPhase).toBe("refresh");
    });

    it("starts each player with 1 free soundcheck resource", () => {
      const state = createInitialGameState(
        "P1",
        createTestDeck(),
        "P2",
        createTestDeck(),
        seededRng(1)
      );
      expect(state.players[0].soundcheck).toHaveLength(1);
      expect(state.players[1].soundcheck).toHaveLength(1);
      expect(state.players[0].soundcheck[0].tapped).toBe(false);
      expect(state.players[0].soundcheck[0].card.name).toBe("Tuning Fork");
    });
  });

  describe("accessors", () => {
    it("getActivePlayer returns correct player", () => {
      const state = createTestState({ activePlayerIndex: 1 });
      expect(getActivePlayer(state)).toBe(state.players[1]);
    });

    it("getOpponent returns the other player", () => {
      const state = createTestState({ activePlayerIndex: 0 });
      expect(getOpponent(state)).toBe(state.players[1]);
    });

    it("opponentIndex returns the other index", () => {
      expect(opponentIndex(0)).toBe(1);
      expect(opponentIndex(1)).toBe(0);
    });
  });

  describe("updatePlayer", () => {
    it("returns new state with updated player", () => {
      const state = createTestState();
      const result = updatePlayer(state, 0, { harmony: 15 });
      expect(result.players[0].harmony).toBe(15);
      expect(result.players[1].harmony).toBe(state.players[1].harmony);
    });

    it("does not mutate original state", () => {
      const state = createTestState();
      const originalHarmony = state.players[0].harmony;
      updatePlayer(state, 0, { harmony: 5 });
      expect(state.players[0].harmony).toBe(originalHarmony);
    });
  });

  describe("updateMusician", () => {
    it("updates musician on stage immutably", () => {
      const musician = createDeployedMusician("front-row");
      const state = createTestState();
      state.players[0].stage = [musician];
      const result = updateMusician(state, 0, 0, { currentTone: 1 });
      expect(result.players[0].stage[0].currentTone).toBe(1);
      expect(state.players[0].stage[0].currentTone).toBe(musician.currentTone);
    });
  });
});
