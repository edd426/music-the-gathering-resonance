# MVP Placeholder Design Decisions

These are assumptions made to ship a playable prototype. Allen, please review and let us know what to change!

## Discordant
- Resonance set to 0 for 1 turn (already in engine). No Volume penalty for MVP.

## Back Line Strikes
- Musicians in the Back Line cannot initiate strikes. They exist to generate Resonance.
- This is enforced by the game controller, not the engine.

## Tempo
- Not mechanically used in MVP. Displayed on cards for flavor.
- Future: determines strike order within a round.

## Power Chord Abilities
- Not implemented for MVP. The stat bonuses (+2 Vol, +2 Res) from the engine are enough.
- Each faction will eventually have a unique Power Chord ability.

## Deck Building
- Max 3 copies per card, free faction mixing.
- Only relevant for the prebuilt decks we ship with.

## Riff Stat Bonuses
- Controller applies stat mods via `updateMusician` after `attachRiffCard`.
- This keeps the engine untouched while still making riffs mechanically meaningful.

## Venue Effects
- Flavor text only for MVP. Venue card replaces the active venue (engine handles this), but passive bonuses are not computed.

## Prebuilt Decks
- **"Rhythm & Ruin"** (Percussion + Electronic): Aggro style, high volume, aims for Clear the Stage.
- **"Harmony Rising"** (Strings + Voice): Control style, high resonance, aims for Silence win.
