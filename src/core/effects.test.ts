import { describe, it, expect, beforeEach } from "vitest";
import {
  registerEffect,
  resolveEffect,
  clearEffects,
  playSongCard,
  attachRiffCard,
  applyVenueCard,
} from "./effects";
import {
  createTestState,
  createTestCard,
  resetTestIds,
} from "./test-helpers";
import type { MusicianCard, SongCard, RiffCard, VenueCard } from "../types/cards";

function createSongCard(overrides: Partial<SongCard> = {}): SongCard {
  return {
    id: "song-1",
    name: "Test Song",
    type: "song",
    cost: 1,
    faction: "strings",
    description: "A test song",
    effect: "test",
    ...overrides,
  };
}

function createRiffCard(overrides: Partial<RiffCard> = {}): RiffCard {
  return {
    id: "riff-1",
    name: "Test Riff",
    type: "riff",
    cost: 1,
    faction: "strings",
    description: "A test riff",
    effect: "test",
    ...overrides,
  };
}

function createVenueCard(overrides: Partial<VenueCard> = {}): VenueCard {
  return {
    id: "venue-1",
    name: "Test Venue",
    type: "venue",
    cost: 1,
    faction: "strings",
    description: "A test venue",
    effect: "test",
    ...overrides,
  };
}

describe("effects", () => {
  beforeEach(() => {
    resetTestIds();
    clearEffects();
  });

  describe("registerEffect / resolveEffect", () => {
    it("applies registered effect", () => {
      registerEffect("test-card", (ctx) => ({
        state: {
          ...ctx.state,
          players: [
            { ...ctx.state.players[0], harmony: 99 },
            ctx.state.players[1],
          ],
        },
      }));
      const state = createTestState();
      const result = resolveEffect("test-card", {
        state,
        playerIndex: 0,
      });
      expect(result.state.players[0].harmony).toBe(99);
    });

    it("returns no-op for unregistered effect", () => {
      const state = createTestState();
      const result = resolveEffect("nonexistent", {
        state,
        playerIndex: 0,
      });
      expect(result.state).toBe(state);
      expect(result.message).toBe("No effect registered");
    });
  });

  describe("playSongCard", () => {
    it("pays cost and moves card to discard", () => {
      const song = createSongCard({ cost: 1 });
      const state = createTestState();
      state.players[0].hand = [song];
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: false },
      ];

      const result = playSongCard(state, 0, 0);
      expect(result.players[0].hand).toHaveLength(0);
      expect(result.players[0].discard).toContain(song);
      expect(result.players[0].soundcheck[0].tapped).toBe(true);
    });

    it("throws for non-Song card", () => {
      const state = createTestState();
      state.players[0].hand = [createTestCard()]; // musician
      expect(() => playSongCard(state, 0, 0)).toThrow("Not a Song card");
    });
  });

  describe("attachRiffCard", () => {
    it("attaches riff to musician", () => {
      const riff = createRiffCard();
      const state = createTestState();
      state.players[0].hand = [riff];
      state.players[0].stage = [
        {
          card: createTestCard() as MusicianCard,
          zone: "front-row",
          currentTone: 3,
          discordantTurnsRemaining: 0,
          attachedRiffs: [],
        },
      ];
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: false },
      ];

      const result = attachRiffCard(state, 0, 0, 0);
      expect(result.players[0].hand).toHaveLength(0);
      expect(result.players[0].stage[0].attachedRiffs).toHaveLength(1);
    });
  });

  describe("applyVenueCard", () => {
    it("sets active venue and discards old", () => {
      const oldVenue = createVenueCard({ id: "old-venue" });
      const newVenue = createVenueCard({ id: "new-venue" });
      const state = createTestState();
      state.activeVenue = oldVenue;
      state.players[0].hand = [newVenue];
      state.players[0].soundcheck = [
        { card: createTestCard(), tapped: false },
      ];

      const result = applyVenueCard(state, 0, 0);
      expect(result.activeVenue).toBe(newVenue);
      expect(result.players[0].discard).toContainEqual(oldVenue);
    });
  });
});
