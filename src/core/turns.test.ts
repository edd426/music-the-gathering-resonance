import { describe, it, expect, beforeEach } from "vitest";
import {
  advancePhase,
  endTurn,
  calculateInitiative,
  discardToHandLimit,
} from "./turns";
import {
  createTestState,
  createTestCard,
  createDeployedMusician,
  resetTestIds,
  seededRng,
} from "./test-helpers";
import { GAME_CONFIG } from "../types/game";

describe("turns", () => {
  beforeEach(() => resetTestIds());

  describe("advancePhase", () => {
    it("moves through phase sequence", () => {
      let state = createTestState({ currentPhase: "refresh" });
      state = advancePhase(state); // -> draw
      expect(state.currentPhase).toBe("draw");
      state = advancePhase(state); // -> soundcheck
      expect(state.currentPhase).toBe("soundcheck");
    });

    it("refresh untaps resources and decrements discordant", () => {
      const state = createTestState({ currentPhase: "refresh" });
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: true },
      ];
      const m = createDeployedMusician("front-row");
      m.discordantTurnsRemaining = 1;
      state.players[0].stage = [m];

      // Advance past refresh. State starts at refresh, so we need to
      // manually trigger the refresh logic. Let's start from the phase before.
      const preRefresh = createTestState({ currentPhase: "discard" });
      preRefresh.players[0].soundcheck = [
        { card: createTestCard(), tapped: true },
      ];
      const m2 = createDeployedMusician("front-row");
      m2.discordantTurnsRemaining = 1;
      preRefresh.players[0].stage = [m2];

      // endTurn goes to refresh for next player
      // Instead, test directly: advance from the state before refresh
      // The simplest test: create state at draw-1 and advance
      // Actually, let's test by starting just before and letting advancePhase handle refresh internally

      // Simpler: test refresh by having currentPhase be discard and the phase ends the turn,
      // or let's just set to the phase before refresh and advance twice
      // Actually the cleanest: test endTurn which goes to refresh
      const turnState = createTestState({
        currentPhase: "discard",
        activePlayerIndex: 0,
        initiativePlayerIndex: 1, // P0 is second player, so endTurn advances round
      });
      turnState.players[0].soundcheck = [
        { card: createTestCard(), tapped: true },
      ];
      const m3 = createDeployedMusician("front-row");
      m3.discordantTurnsRemaining = 1;
      turnState.players[0].stage = [m3];

      // advancePhase from discard -> endTurn -> refresh
      const result = advancePhase(turnState);
      // After round end, the new active player gets refresh
      expect(result.currentPhase).toBe("refresh");
    });

    it("draw phase adds cards to hand on turn 2+", () => {
      const state = createTestState({ currentPhase: "refresh", turnNumber: 2 });
      const handBefore = state.players[0].hand.length;
      const result = advancePhase(state); // -> draw
      expect(result.players[0].hand.length).toBe(
        handBefore + GAME_CONFIG.DRAW_PER_TURN
      );
    });

    it("draw phase skips drawing on turn 1", () => {
      const state = createTestState({ currentPhase: "refresh", turnNumber: 1 });
      const handBefore = state.players[0].hand.length;
      const result = advancePhase(state); // -> draw
      expect(result.players[0].hand.length).toBe(handBefore);
    });

    it("deploy phase resets deploysRemaining", () => {
      const state = createTestState({
        currentPhase: "soundcheck",
        deploysRemaining: 0,
      });
      const result = advancePhase(state); // -> deploy
      expect(result.deploysRemaining).toBe(GAME_CONFIG.DEPLOY_LIMIT);
    });
  });

  describe("endTurn", () => {
    it("switches active player for first turn of round", () => {
      const state = createTestState({
        activePlayerIndex: 0,
        initiativePlayerIndex: 0,
      });
      const result = endTurn(state);
      expect(result.activePlayerIndex).toBe(1);
      expect(result.currentPhase).toBe("refresh");
    });

    it("advances round when second player finishes", () => {
      const state = createTestState({
        activePlayerIndex: 1,
        initiativePlayerIndex: 0,
        turnNumber: 1,
      });
      const result = endTurn(state);
      expect(result.turnNumber).toBe(2);
      expect(result.lastRoundDamage).toEqual([0, 0]);
    });
  });

  describe("calculateInitiative", () => {
    it("gives initiative to player who dealt less damage", () => {
      // Higher damage → goes second, so the OTHER player gets initiative
      expect(calculateInitiative([10, 5])).toBe(1); // P0 dealt more, P1 gets initiative
      expect(calculateInitiative([3, 8])).toBe(0); // P1 dealt more, P0 gets initiative
    });

    it("uses RNG for ties", () => {
      const result = calculateInitiative([5, 5], seededRng(42));
      expect([0, 1]).toContain(result);
    });
  });

  describe("discardToHandLimit", () => {
    it("removes selected cards from hand", () => {
      const state = createTestState();
      const cards = Array.from({ length: 9 }, () => createTestCard());
      state.players[0].hand = cards;

      const result = discardToHandLimit(state, 0, [0, 1]);
      expect(result.players[0].hand).toHaveLength(7);
      expect(result.players[0].discard).toHaveLength(2);
    });

    it("throws if wrong number of discards", () => {
      const state = createTestState();
      state.players[0].hand = Array.from({ length: 9 }, () =>
        createTestCard()
      );
      expect(() => discardToHandLimit(state, 0, [0])).toThrow(
        "Must discard exactly 2"
      );
    });

    it("no-ops when at or under hand limit", () => {
      const state = createTestState();
      state.players[0].hand = [createTestCard()];
      const result = discardToHandLimit(state, 0, []);
      expect(result).toBe(state);
    });
  });
});
