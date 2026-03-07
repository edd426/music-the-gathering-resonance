import { GAME_CONFIG } from "../../types/game";

export function renderHarmonyMeter(harmony: number): string {
  const max = GAME_CONFIG.STARTING_HARMONY;
  const pct = Math.max(0, (harmony / max) * 100);

  const level = pct > 60 ? "high" : pct > 30 ? "mid" : "low";

  return `
    <div class="harmony-meter">
      <div class="harmony-bar">
        <div class="harmony-fill ${level}" style="width: ${pct}%;"></div>
      </div>
      <span>${harmony}/${max}</span>
    </div>
  `;
}
