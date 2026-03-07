import type { SoundcheckResource } from "../../types/game";

export function renderSoundcheckDisplay(resources: SoundcheckResource[]): string {
  if (resources.length === 0) {
    return `<div class="soundcheck-area"><span>Soundcheck: none</span></div>`;
  }

  const dots = resources
    .map((r) => {
      const cls = r.tapped ? "soundcheck-dot tapped" : "soundcheck-dot available";
      return `<span class="${cls}" title="${r.tapped ? "Tapped" : "Available"}"></span>`;
    })
    .join("");

  const available = resources.filter((r) => !r.tapped).length;

  return `
    <div class="soundcheck-area">
      <span>Soundcheck:</span>
      <div class="soundcheck-dots">${dots}</div>
      <span>(${available} available)</span>
    </div>
  `;
}
