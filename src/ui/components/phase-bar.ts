import type { TurnPhase } from "../../types/game";

const PHASES: TurnPhase[] = [
  "refresh", "draw", "soundcheck", "deploy",
  "equip-song", "strike", "resonance", "discard",
];

const PHASE_LABELS: Record<TurnPhase, string> = {
  refresh: "Refresh",
  draw: "Draw",
  soundcheck: "Soundcheck",
  deploy: "Deploy",
  "equip-song": "Equip/Song",
  strike: "Strike",
  resonance: "Resonance",
  discard: "Discard",
};

export function renderPhaseBar(currentPhase: TurnPhase): string {
  const currentIdx = PHASES.indexOf(currentPhase);

  const steps = PHASES.map((p, i) => {
    let cls = "phase-step";
    if (i === currentIdx) cls += " active";
    else if (i < currentIdx) cls += " done";
    return `<span class="${cls}">${PHASE_LABELS[p]}</span>`;
  }).join("");

  return `<div class="phase-bar">${steps}</div>`;
}
