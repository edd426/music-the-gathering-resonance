import type { WinResult } from "../../core";

export function renderWinScreen(winResult: WinResult, winnerName: string): string {
  const condition = winResult.condition === "silence"
    ? "Silence — Harmony reduced to zero!"
    : "Clear the Stage — No musicians remain!";

  return `
    <div class="win-overlay" id="win-overlay">
      <div class="win-panel">
        <h2>${winnerName === "You" ? "You Win!" : `${winnerName} Wins!`}</h2>
        <p>${condition}</p>
        <button class="action-btn primary" data-action="restart">Main Menu</button>
      </div>
    </div>
  `;
}
