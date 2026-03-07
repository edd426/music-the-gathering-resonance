import { registerEffect, updateMusician, opponentIndex, drawCards } from "../core";
import type { EffectContext, EffectResult } from "../types/effects";

function crescendoEffect(ctx: EffectContext): EffectResult {
  const { state, playerIndex, targets } = ctx;
  if (!targets || targets.length === 0) {
    return { state, message: "No target selected." };
  }
  const musicianIdx = targets[0];
  const player = state.players[playerIndex];
  const musician = player.stage[musicianIdx];
  if (!musician) {
    return { state, message: "Invalid target." };
  }
  // +3 Volume implemented as a temporary boost — for MVP we modify the card's volume
  // This is a simplification; a proper system would track temporary buffs
  const newCard = { ...musician.card, volume: musician.card.volume + 3 };
  const newState = updateMusician(state, playerIndex, musicianIdx, {
    card: newCard,
  });
  return { state: newState, message: `${musician.card.name} surges with +3 Volume!` };
}

function fortissimoEffect(ctx: EffectContext): EffectResult {
  const { state, playerIndex, targets } = ctx;
  if (!targets || targets.length === 0) {
    return { state, message: "No target selected." };
  }
  const oppIdx = opponentIndex(playerIndex);
  const targetIdx = targets[0];
  const opponent = state.players[oppIdx];
  const target = opponent.stage[targetIdx];
  if (!target) {
    return { state, message: "Invalid target." };
  }
  const newTone = target.currentTone - 2;
  const newState = updateMusician(state, oppIdx, targetIdx, {
    currentTone: newTone,
  });
  return {
    state: newState,
    message: `Fortissimo blasts ${target.card.name} for 2 damage!`,
  };
}

function lullabyEffect(ctx: EffectContext): EffectResult {
  const { state, playerIndex, targets } = ctx;
  if (!targets || targets.length === 0) {
    return { state, message: "No target selected." };
  }
  const oppIdx = opponentIndex(playerIndex);
  const targetIdx = targets[0];
  const opponent = state.players[oppIdx];
  const target = opponent.stage[targetIdx];
  if (!target) {
    return { state, message: "Invalid target." };
  }
  const newState = updateMusician(state, oppIdx, targetIdx, {
    discordantTurnsRemaining: 1,
  });
  return {
    state: newState,
    message: `${target.card.name} falls into a Lullaby — discordant for 1 turn!`,
  };
}

function encoreEffect(ctx: EffectContext): EffectResult {
  const { state, playerIndex } = ctx;
  const newState = drawCards(state, playerIndex, 2);
  return { state: newState, message: "Encore! Drew 2 cards." };
}

export function registerAllEffects(): void {
  registerEffect("song-crescendo", crescendoEffect);
  registerEffect("song-fortissimo", fortissimoEffect);
  registerEffect("song-lullaby", lullabyEffect);
  registerEffect("song-encore", encoreEffect);
}
