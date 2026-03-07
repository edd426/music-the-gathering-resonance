import { describe, it, expect, beforeEach } from "vitest";
import { shuffleDeck, drawCards } from "./deck";
import {
  createTestState,
  createTestDeck,
  resetTestIds,
  seededRng,
} from "./test-helpers";

describe("deck", () => {
  beforeEach(() => resetTestIds());

  describe("shuffleDeck", () => {
    it("returns same number of cards", () => {
      const deck = createTestDeck(10);
      const shuffled = shuffleDeck(deck, seededRng(42));
      expect(shuffled).toHaveLength(10);
    });

    it("contains all original cards", () => {
      const deck = createTestDeck(10);
      const shuffled = shuffleDeck(deck, seededRng(42));
      const originalIds = deck.map((c) => c.id).sort();
      const shuffledIds = shuffled.map((c) => c.id).sort();
      expect(shuffledIds).toEqual(originalIds);
    });

    it("changes card order with seeded RNG", () => {
      const deck = createTestDeck(10);
      const shuffled = shuffleDeck(deck, seededRng(42));
      const sameOrder = deck.every((c, i) => c.id === shuffled[i].id);
      expect(sameOrder).toBe(false);
    });

    it("does not mutate original deck", () => {
      const deck = createTestDeck(5);
      const originalIds = deck.map((c) => c.id);
      shuffleDeck(deck, seededRng(1));
      expect(deck.map((c) => c.id)).toEqual(originalIds);
    });

    it("preserves order when rng is null", () => {
      const deck = createTestDeck(10);
      const result = shuffleDeck(deck, null);
      expect(result.map((c) => c.id)).toEqual(deck.map((c) => c.id));
      expect(result).not.toBe(deck); // Returns a copy
    });
  });

  describe("drawCards", () => {
    it("moves cards from deck to hand", () => {
      const state = createTestState();
      const deckBefore = state.players[0].deck.length;
      const handBefore = state.players[0].hand.length;
      const result = drawCards(state, 0, 3);
      expect(result.players[0].hand).toHaveLength(handBefore + 3);
      expect(result.players[0].deck).toHaveLength(deckBefore - 3);
    });

    it("recycles discard when deck is empty", () => {
      const state = createTestState();
      const discardCards = createTestDeck(5);
      state.players[0].deck = [];
      state.players[0].discard = discardCards;
      const result = drawCards(state, 0, 2);
      expect(result.players[0].hand).toHaveLength(2);
      expect(result.players[0].discard).toHaveLength(0);
      expect(result.players[0].deck).toHaveLength(3);
    });

    it("draws nothing when deck and discard are both empty", () => {
      const state = createTestState();
      state.players[0].deck = [];
      state.players[0].discard = [];
      const result = drawCards(state, 0, 3);
      expect(result.players[0].hand).toHaveLength(0);
    });

    it("does not mutate original state", () => {
      const state = createTestState();
      const deckLen = state.players[0].deck.length;
      drawCards(state, 0, 2);
      expect(state.players[0].deck).toHaveLength(deckLen);
    });
  });
});
