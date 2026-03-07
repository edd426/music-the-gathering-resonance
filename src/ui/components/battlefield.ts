import type { Zone } from "../../types/cards";
import type { DeployedMusician } from "../../types/game";
import { detectChords, getEffectiveVolume, getEffectiveResonance } from "../../core";
import { FACTION_COLORS } from "../styles";

interface BattlefieldOptions {
  stage: DeployedMusician[];
  playerIndex: number;
  isActivePlayer: boolean;
  showZoneTargets: boolean;
  selectableAttackers: Set<number>;
  attackTargets: Set<number>;
  isOpponent: boolean;
}

export function renderBattlefield(opts: BattlefieldOptions): string {
  const { stage, playerIndex, showZoneTargets, selectableAttackers, attackTargets, isOpponent } = opts;
  const chords = detectChords(stage);
  const chordMembers = new Set<number>();
  for (const chord of chords) {
    for (const idx of chord.members) {
      chordMembers.add(idx);
    }
  }

  const zones: Zone[] = isOpponent
    ? ["back-line", "mid-stage", "front-row"]
    : ["front-row", "mid-stage", "back-line"];

  const zoneHtml = zones.map((zone) => {
    const musicians = stage
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.zone === zone);

    const musicianCards = musicians.map(({ m, i }) => {
      const classes: string[] = ["deployed-musician"];
      if (m.discordantTurnsRemaining > 0) classes.push("discordant");
      if (chordMembers.has(i)) classes.push("chord-member");
      if (selectableAttackers.has(i)) classes.push("selectable");
      if (attackTargets.has(i)) classes.push("attack-target");

      const factionColor = FACTION_COLORS[m.card.faction];
      const effVol = getEffectiveVolume(stage, i);
      const effRes = getEffectiveResonance(stage, i);
      const riffs = m.attachedRiffs.length > 0
        ? `<div class="riff-indicator">${m.attachedRiffs.map((r) => r.name).join(", ")}</div>`
        : "";

      const dataAttr = selectableAttackers.has(i)
        ? `data-attacker="${i}" data-player="${playerIndex}"`
        : attackTargets.has(i)
        ? `data-target="${i}" data-player="${playerIndex}"`
        : "";

      const tonePct = Math.max(0, (m.currentTone / m.card.tone) * 100);
      const toneColor = tonePct > 60 ? "#4ecdc4" : tonePct > 30 ? "#c9b037" : "#ff6b35";

      return `
        <div class="${classes.join(" ")}" ${dataAttr}
             style="--faction-color: ${factionColor};">
          <div class="name">${m.card.name}</div>
          <div class="stats">
            <span class="stat-vol">Vol ${effVol}</span>
            <span class="stat-tone">Tone ${m.currentTone}/${m.card.tone}</span>
            ${m.card.resonance > 0 ? `<span class="stat-res">Res ${effRes}</span>` : ""}
          </div>
          <div class="tone-bar"><div class="tone-bar-fill" style="width: ${tonePct}%; background: ${toneColor};"></div></div>
          ${riffs}
        </div>
      `;
    }).join("");

    const zoneClass = showZoneTargets ? "zone drop-target" : "zone";
    const dataZone = showZoneTargets ? `data-zone="${zone}"` : "";

    return `
      <div class="${zoneClass}" ${dataZone}>
        <div class="zone-label">${zone}</div>
        ${musicianCards}
      </div>
    `;
  }).join("");

  return `<div class="stage">${zoneHtml}</div>`;
}
