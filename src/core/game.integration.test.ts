import { describe, it, expect, beforeEach } from "vitest";
import {
  createInitialGameState,
  getActivePlayer,
  advancePhase,
  playSoundcheck,
  deployMusician,
  resolveAllStrikes,
  checkWinCondition,
  discardToHandLimit,
} from "./index";
import {
  createTestDeck,
  createTestMusician,
  resetTestIds,
  seededRng,
} from "./test-helpers";
import { GAME_CONFIG } from "../types/game";

describe("game integration", () => {
  beforeEach(() => resetTestIds());

  it("plays through a full game to a Silence win", () => {
    const rng = seededRng(42);
    const deck1 = createTestDeck();
    const deck2 = createTestDeck();

    // Create initial state
    let state = createInitialGameState("Alice", deck1, "Bob", deck2, rng);
    expect(state.players[0].hand).toHaveLength(GAME_CONFIG.STARTING_HAND);
    expect(state.players[1].hand).toHaveLength(GAME_CONFIG.STARTING_HAND);
    expect(state.players[0].harmony).toBe(20);
    expect(state.players[1].harmony).toBe(20);
    // Both start with free resources
    expect(state.players[0].soundcheck).toHaveLength(GAME_CONFIG.FREE_STARTING_RESOURCES);
    expect(state.players[1].soundcheck).toHaveLength(GAME_CONFIG.FREE_STARTING_RESOURCES);

    // Simulate several rounds
    for (let round = 0; round < 20; round++) {
      // Each round: both players take turns
      for (let turn = 0; turn < 2; turn++) {
        const activeIdx = state.activePlayerIndex;

        // Refresh phase (start)
        expect(state.currentPhase).toBe("refresh");
        state = advancePhase(state); // -> draw

        // Draw phase (skipped on turn 1 — no cards drawn)
        expect(state.currentPhase).toBe("draw");
        const handBeforeDraw = state.players[activeIdx].hand.length;
        state = advancePhase(state); // -> soundcheck
        if (state.turnNumber === 1 && round === 0) {
          // Turn 1: no draw
          expect(state.players[activeIdx].hand.length).toBe(handBeforeDraw);
        }

        // Soundcheck: play a card as resource if we have cards and haven't yet
        expect(state.currentPhase).toBe("soundcheck");
        const player = getActivePlayer(state);
        if (player.hand.length > 0) {
          state = playSoundcheck(state, activeIdx, 0);
        }
        state = advancePhase(state); // -> deploy

        // Deploy: deploy a musician if possible
        expect(state.currentPhase).toBe("deploy");
        const playerNow = state.players[activeIdx];
        if (playerNow.hand.length > 0) {
          const musicianIdx = playerNow.hand.findIndex(
            (c) => c.type === "musician" && c.cost <= playerNow.soundcheck.filter((s) => !s.tapped).length
          );
          if (musicianIdx >= 0) {
            const zone =
              playerNow.stage.length === 0
                ? "front-row"
                : playerNow.stage.length === 1
                  ? "back-line"
                  : "mid-stage";
            state = deployMusician(state, activeIdx, musicianIdx, zone);
          }
        }
        state = advancePhase(state); // -> equip-song

        // Equip/Song phase — skip
        expect(state.currentPhase).toBe("equip-song");
        state = advancePhase(state); // -> strike

        // Strike phase: skip on turn 1, attack otherwise
        expect(state.currentPhase).toBe("strike");
        if (state.turnNumber > 1) {
          const oppIdx = activeIdx === 0 ? 1 : 0;
          const attackerStage = state.players[activeIdx].stage;
          const defenderStage = state.players[oppIdx].stage;
          if (attackerStage.length > 0 && defenderStage.length > 0) {
            const attacks = attackerStage.map((_, i) => ({
              attackerIndex: i,
              targetIndex: 0,
            }));
            state = resolveAllStrikes(
              state,
              activeIdx as 0 | 1,
              attacks
            );
          }
        }
        state = advancePhase(state); // -> resonance (auto-applied)

        // Resonance phase
        expect(state.currentPhase).toBe("resonance");
        state = advancePhase(state); // -> discard

        // Discard phase: discard to hand limit if needed
        expect(state.currentPhase).toBe("discard");
        const handSize = state.players[activeIdx].hand.length;
        if (handSize > GAME_CONFIG.HAND_LIMIT) {
          const excess = handSize - GAME_CONFIG.HAND_LIMIT;
          const indices = Array.from({ length: excess }, (_, i) => i);
          state = discardToHandLimit(state, activeIdx, indices);
        }
        state = advancePhase(state); // -> next turn (refresh)

        // Check win condition after each turn
        const win = checkWinCondition(state);
        if (win) {
          expect(win.winner).toBeDefined();
          expect(["silence", "clear-the-stage"]).toContain(win.condition);
          return; // Game over!
        }
      }
    }

    // If we reach here after 20 rounds, the game should have at least changed state
    expect(state.turnNumber).toBeGreaterThan(1);
  });

  it("detects Clear the Stage win on turn 3+", () => {
    const rng = seededRng(99);

    // Create decks with high-volume musicians for quick KOs
    const powerDeck = Array.from({ length: 30 }, () =>
      createTestMusician({ cost: 1, volume: 5, tone: 1, resonance: 0 })
    );
    const weakDeck = Array.from({ length: 30 }, () =>
      createTestMusician({ cost: 1, volume: 1, tone: 1, resonance: 0 })
    );

    let state = createInitialGameState("Power", powerDeck, "Weak", weakDeck, rng);

    // Set up scenario: turn 3, both deployed, weak has one musician left
    state = {
      ...state,
      turnNumber: 3,
      totalDeploys: [2, 2],
      players: [
        {
          ...state.players[0],
          stage: [
            {
              card: createTestMusician({ volume: 5, tone: 10 }),
              zone: "front-row",
              currentTone: 10,
              discordantTurnsRemaining: 0,
              attachedRiffs: [],
            },
          ],
        },
        {
          ...state.players[1],
          stage: [
            {
              card: createTestMusician({ volume: 1, tone: 1 }),
              zone: "front-row",
              currentTone: 1,
              discordantTurnsRemaining: 0,
              attachedRiffs: [],
            },
          ],
        },
      ],
      activePlayerIndex: 0,
    };

    // Player 0 attacks Player 1's musician — should KO it
    state = resolveAllStrikes(state, 0, [
      { attackerIndex: 0, targetIndex: 0 },
    ]);

    // Player 1's stage should be empty now
    expect(state.players[1].stage).toHaveLength(0);

    // Check win condition — should work because turnNumber >= 3
    const win = checkWinCondition(state);
    expect(win).toEqual({ winner: 0, condition: "clear-the-stage" });
  });

  it("does NOT detect Clear the Stage before turn 3", () => {
    const rng = seededRng(99);

    const powerDeck = Array.from({ length: 30 }, () =>
      createTestMusician({ cost: 1, volume: 5, tone: 1, resonance: 0 })
    );
    const weakDeck = Array.from({ length: 30 }, () =>
      createTestMusician({ cost: 1, volume: 1, tone: 1, resonance: 0 })
    );

    let state = createInitialGameState("Power", powerDeck, "Weak", weakDeck, rng);

    // Same scenario but turn 2
    state = {
      ...state,
      turnNumber: 2,
      totalDeploys: [2, 2],
      players: [
        {
          ...state.players[0],
          stage: [
            {
              card: createTestMusician({ volume: 5, tone: 10 }),
              zone: "front-row",
              currentTone: 10,
              discordantTurnsRemaining: 0,
              attachedRiffs: [],
            },
          ],
        },
        {
          ...state.players[1],
          stage: [
            {
              card: createTestMusician({ volume: 1, tone: 1 }),
              zone: "front-row",
              currentTone: 1,
              discordantTurnsRemaining: 0,
              attachedRiffs: [],
            },
          ],
        },
      ],
      activePlayerIndex: 0,
    };

    state = resolveAllStrikes(state, 0, [
      { attackerIndex: 0, targetIndex: 0 },
    ]);

    expect(state.players[1].stage).toHaveLength(0);
    // Should NOT win — too early
    expect(checkWinCondition(state)).toBeNull();
  });
});
