# Resonance: Battle of the Bands

A web-based fantasy TCG with generative music. Built by Evan and Allen DeLord.

## Tech Stack

- TypeScript, Vite, Web Audio API
- Testing: Vitest
- Linting: ESLint + Prettier
- Package manager: pnpm

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — type-check and build
- `pnpm test` — run tests in watch mode
- `pnpm test:run` — run tests once
- `pnpm lint` — lint source files
- `pnpm format` — format source files

## Project Structure

- `src/types/` — TypeScript interfaces (cards, game state)
- `src/core/` — Game engine (rules, state management, turns)
- `src/audio/` — Web Audio / generative music layer
- `src/ui/` — Rendering and user interaction
- `docs/` — Design documents and specs

## Conventions

- Strict TypeScript (no `any`)
- Use discriminated unions for card types (see `src/types/cards.ts`)
- Game state is immutable — produce new state objects, don't mutate
- All game rules belong in `src/core/`, never in UI code
- Tests go next to source files as `*.test.ts`

## Design Reference

The full game design spec is at `docs/design.md`. Allen's original concept conversation is at:
https://claude.ai/share/d3395edd-ccc4-4e28-8b4c-a07903157f0c
