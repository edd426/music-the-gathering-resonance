import type { LogEntry } from "../../game/log";

export function renderGameLog(entries: readonly LogEntry[]): string {
  const logEntries = entries
    .slice()
    .reverse()
    .slice(0, 50)
    .map(
      (e) =>
        `<div class="log-entry"><span class="log-player">[T${e.turn}] ${e.player}:</span> ${e.message}</div>`
    )
    .join("");

  return `
    <div class="game-log">
      ${logEntries || '<div class="log-entry">Game starting...</div>'}
    </div>
  `;
}
