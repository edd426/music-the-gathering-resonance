# Music: The Gathering — Resonance

**Resonance: Battle of the Bands** is a fantasy trading card game where two rival band managers summon musician creatures to a stage battlefield, competing for harmonic dominance.

Built as a web-based digital card game with a generative music layer — the board state composes real-time music as you play.

## Concept

- Five instrument factions (Winds, Percussion, Strings, Electronic, Voice) with distinct playstyles
- A 3-zone stage battlefield (Front Row, Mid Stage, Back Line) with positional strategy
- Dual win conditions: drain your opponent's Harmony Meter to 0, or clear their stage
- Chord Chains reward faction synergy with Power Chord abilities
- Every card has a musical stem — the game is a live mixer

See the full [design document](docs/design.md) for details.

## Tech Stack

- **TypeScript** — type-safe game logic
- **Vite** — dev server and bundler
- **Web Audio API** — generative music layer
- **Vitest** — testing

## Getting Started

```bash
pnpm install
pnpm dev
```

## License

MIT — Evan DeLord & Allen DeLord
