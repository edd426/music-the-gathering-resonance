export interface LogEntry {
  turn: number;
  player: string;
  message: string;
}

export class GameLog {
  private entries: LogEntry[] = [];

  add(turn: number, player: string, message: string): void {
    this.entries.push({ turn, player, message });
  }

  getAll(): readonly LogEntry[] {
    return this.entries;
  }

  clear(): void {
    this.entries = [];
  }
}
