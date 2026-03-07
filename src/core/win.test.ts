import { describe, it, expect, beforeEach } from "vitest";
import { checkWinCondition } from "./win";
import {
  createTestState,
  createDeployedMusician,
  resetTestIds,
} from "./test-helpers";

describe("win", () => {
  beforeEach(() => resetTestIds());

  it("returns null when no win condition met", () => {
    const state = createTestState();
    expect(checkWinCondition(state)).toBeNull();
  });

  it("detects Silence win when opponent harmony is 0", () => {
    const state = createTestState();
    state.players[1].harmony = 0;
    const result = checkWinCondition(state);
    expect(result).toEqual({ winner: 0, condition: "silence" });
  });

  it("detects Silence win when opponent harmony is negative", () => {
    const state = createTestState();
    state.players[0].harmony = -3;
    const result = checkWinCondition(state);
    expect(result).toEqual({ winner: 1, condition: "silence" });
  });

  it("detects Clear the Stage when opponent has deployed, has no musicians, and turn >= 3", () => {
    const state = createTestState({
      totalDeploys: [2, 2],
      turnNumber: 3,
    });
    state.players[1].stage = [];
    const result = checkWinCondition(state);
    expect(result).toEqual({ winner: 0, condition: "clear-the-stage" });
  });

  it("does NOT trigger Clear the Stage before turn 3", () => {
    const state = createTestState({
      totalDeploys: [2, 2],
      turnNumber: 2,
    });
    state.players[1].stage = [];
    expect(checkWinCondition(state)).toBeNull();
  });

  it("does NOT trigger Clear the Stage if opponent never deployed", () => {
    const state = createTestState({
      totalDeploys: [2, 0],
      turnNumber: 3,
    });
    state.players[0].stage = [createDeployedMusician()];
    state.players[1].stage = [];
    expect(checkWinCondition(state)).toBeNull();
  });

  it("does NOT trigger Clear the Stage if opponent still has musicians", () => {
    const state = createTestState({
      totalDeploys: [2, 2],
      turnNumber: 3,
    });
    state.players[0].stage = [createDeployedMusician()];
    state.players[1].stage = [createDeployedMusician()];
    expect(checkWinCondition(state)).toBeNull();
  });
});
