import type { Card } from "../../types/cards";
import { FACTION_COLORS } from "../styles";
import { getCardArtPath } from "../card-art";

interface HandOptions {
  cards: Card[];
  availableResources: number;
  phase: string;
  selectedIndices: Set<number>;
}

export function renderHand(opts: HandOptions): string {
  const { cards, availableResources, phase, selectedIndices } = opts;

  if (cards.length === 0) {
    return `<div class="hand-area"><div class="hand-label">Hand (empty)</div></div>`;
  }

  const cardElements = cards.map((card, i) => {
    const playable = isCardPlayable(card, availableResources, phase);
    const selected = selectedIndices.has(i);
    const classes: string[] = ["card"];
    if (!playable && phase !== "discard") classes.push("unplayable");
    if (selected) classes.push("selected");

    const factionColor = FACTION_COLORS[card.faction];
    const statsHtml = renderCardStats(card);
    const artPath = getCardArtPath(card.id);
    const artHtml = artPath
      ? `<div class="card-art" style="background-image: url('${artPath}');"></div>`
      : `<div class="card-art card-art-placeholder"></div>`;

    const costPips = renderCostPips(card.cost);

    return `
      <div class="${classes.join(" ")}" data-hand-index="${i}"
           style="--faction-color: ${factionColor};">
        <div class="card-header">
          <div class="card-name">${card.name}</div>
          ${costPips}
        </div>
        ${artHtml}
        <div class="card-info">
          <span class="card-badge ${card.type}">${card.type}</span>
          <span class="card-faction">${card.faction}</span>
        </div>
        ${statsHtml}
        <div class="card-desc">${card.description}</div>
      </div>
    `;
  }).join("");

  // Compute overlap so cards fit in ~600px container
  const overlapPx = cards.length <= 2 ? 0
    : cards.length <= 4 ? -40
    : Math.max(-100, Math.round(-150 + (600 / cards.length)));

  return `
    <div class="hand-area">
      <div class="hand-label">Hand (${cards.length})</div>
      <div class="hand" style="--overlap: ${overlapPx}px;">${cardElements}</div>
    </div>
  `;
}

function isCardPlayable(card: Card, resources: number, phase: string): boolean {
  switch (phase) {
    case "soundcheck": return true;
    case "deploy": return card.type === "musician" && resources >= card.cost;
    case "equip-song":
      return (card.type === "song" || card.type === "riff" || card.type === "venue")
        && resources >= card.cost;
    case "discard": return true;
    default: return false;
  }
}

function renderCardStats(card: Card): string {
  if (card.type === "musician") {
    return `<div class="card-stats">
      <span class="stat-vol" title="Volume (attack)">⚔ ${card.volume}</span>
      <span class="stat-tone" title="Tone (health)">♥ ${card.tone}</span>
      <span class="stat-tempo" title="Tempo (speed)">⚡ ${card.tempo}</span>
      <span class="stat-range" title="Range">${card.range}</span>
      ${card.resonance > 0 ? `<span class="stat-res" title="Resonance">✦ ${card.resonance}</span>` : ""}
    </div>`;
  }
  return "";
}

function renderCostPips(cost: number): string {
  const pips = Array.from({ length: cost }, () => `<span class="cost-pip"></span>`).join("");
  return `<div class="card-cost-pips">${pips}</div>`;
}
