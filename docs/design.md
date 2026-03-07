# Resonance: Battle of the Bands — Core Design Document

> Original concept by Allen DeLord, March 2026

## The Core Fantasy

Two players are rival band managers summoning musician creatures to a **stage battlefield**. Victory isn't just about defeating opponents — it's about achieving **harmonic dominance**.

## The Five Instrument Factions

Each faction has a distinct playstyle:

| Faction | Archetype | Playstyle |
|---------|-----------|-----------|
| **Winds** (brass/woodwinds) | The Sustainers | Long-lasting buffs, area control, "breath" resource management |
| **Percussion** | The Bruisers | High burst damage, rhythm combos, tempo manipulation |
| **Strings** | The Tacticians | Precise, low-cost, combo chains, lots of synergies |
| **Electronic** | The Disruptors | Tech/hacking mechanics, distort enemy cards, recursion |
| **Voice** | The Enchanters | Crowd control, morale effects, inspire/debuff auras |

## The Battlefield: The Stage

The battlefield is divided into **3 zones per player** — like lanes on a stage:

```
[ FRONT ROW ]   [ MID STAGE ]   [ BACK LINE ]
  (melee)        (support)      (ranged/safe)
```

Position matters mechanically:

- **Front Row**: Cards deal and take full damage. Soloists shine here.
- **Mid Stage**: Cards gain **Ensemble Bonus** (+1 Volume, +1 Tone) if flanked by same-faction allies in both Front Row and Back Line.
- **Back Line**: Cards deal reduced damage but generate **Resonance Points** each turn (based on the card's Resonance stat), draining the opponent's Harmony Meter.

## Resource System: Soundcheck

Players pay for cards using **Soundcheck** — any card from hand can be played face-down as a Soundcheck resource.

- **One Soundcheck per turn** — you may play one card face-down as a resource each turn
- **Tap and refresh** — Soundcheck resources tap to pay costs and refresh at the start of your turn
- Each face-down Soundcheck card provides 1 resource when tapped
- Soundchecked cards remain on the table for the rest of the game (they don't go to discard)

This means every card in your hand is a choice: play it for its effect, or Soundcheck it to fuel something bigger.

## Card Types

### Musician Cards

Your creatures. Each has:

- **Instrument Type** (faction)
- **Cost** (Soundcheck resources to deploy: 1–5)
- **Volume** (attack power: 1–5)
- **Tone** (defense/health: 1–5, decreases as damage is taken, knocked out at 0)
- **Tempo** (speed/initiative: 1–5)
- **Range** (melee, mid-reach, or sniper)
- **Resonance** (Harmony drain per turn in Back Line: 0–3)
- **A special ability** — tied to their instrument archetype

### Song Cards

Instants/spells. Activated effects like:

- **"Crescendo"** — double a front row card's Volume this turn
- **"Dissonance Strike"** — interrupt an opponent's combo
- **"Bridge Section"** — switch two of your cards between zones for free

### Riff Cards

Equipment/enchantments that attach to musicians. A guitarist might equip a **Whammy Bar** for extra reach, a drummer might get a **Double Kick Pedal**.

### Venue Cards

Field modifiers that affect the whole battlefield. Only **one venue can be active at a time** — playing a new venue replaces the current one.

- **"The Dive Bar"** — boosts Percussion
- **"Carnegie Hall"** — buffs Strings

## Win Conditions

1. **Silence** — Drain your opponent's Harmony Meter to 0 using Resonance Points from Back Line musicians.
2. **Clear the Stage** — Knock out all of your opponent's musicians.

## The Harmony System

Each player has a **Harmony Meter** starting at **20**.

- During the Resonance Phase, each of your Back Line musicians generates Resonance Points equal to their **Resonance stat** (0–3).
- Your total Resonance Points drain from the opponent's Harmony Meter each turn.
- A player reaching 0 Harmony has been **silenced** — they lose.

## Turn Order: Initiative

Turn order is determined by the **previous round's outcome**:

- The player who dealt more total damage (or generated more Resonance) in the previous round goes **second** in the next round (a catch-up mechanic).
- Going second is a disadvantage in aggression but an advantage in reaction — you see what your opponent does before responding.
- **First round**: determined randomly (coin flip).

## Combat

Combat is **mutual** — when a musician attacks a target, both deal damage simultaneously.

- The attacker deals their **Volume** as damage to the target's **Tone**.
- The defender deals their **Volume** back to the attacker's **Tone**.
- **Tone decreases** as damage accumulates. A musician is **knocked out** when Tone reaches 0.

### Targeting Rules

Range determines who you can attack, but **you must clear zones from front to back**:

- **Melee** — can only target the opponent's Front Row
- **Mid-reach** — can target Front Row or Mid Stage
- **Sniper** — can target any zone

**However**: you cannot target a zone behind one that still has musicians. Front Row must be cleared before Mid Stage can be targeted, and Mid Stage must be cleared before Back Line.

## Combo Mechanic: Chord Chains (Tiered)

Same-faction musicians in adjacent zones form Chords:

### Minor Chord (2 adjacent same-faction musicians)
- +1 Volume to both
- +1 Resonance output to both

### Power Chord (3 same-faction musicians across all zones)
- +2 Volume to all three
- Resonance output doubles for all three
- Unlocks a faction-specific **Power Chord ability**

### Breaking a Chord
Removing a Chord member causes remaining members to become **Discordant** for one turn — a weakened state (specifics TBD during playtesting).

## Turn Structure

1. **Refresh** — untap all Soundcheck resources
2. **Initiative** — determined by previous round (first round: random)
3. **Draw Phase** — draw 2 cards
4. **Soundcheck** — optionally play 1 card face-down as a resource
5. **Deploy Phase** — play up to 2 Musician cards to any zone (paying their Soundcheck cost)
6. **Equip/Song Phase** — play Riff or Song cards (paying their cost)
7. **Strike Phase** — each musician attacks; resolve mutual combat
8. **Resonance Phase** — count Back Line Resonance, drain opponent's Harmony Meter
9. **Discard** — down to hand limit (7)

## Deck Building Rules

- **Deck size**: 30 cards
- **Starting hand**: 5 cards
- **Draw per turn**: 2 cards
- **Hand limit**: 7 cards
- **Deploy limit**: 2 musicians per turn

## The Digital Version: Generative Music Layer

Each card type has a base musical "stem" — a loopable musical phrase in a specific instrument (banjo riff, kick pattern, string swell, synth arpeggio).

**The battlefield is a live mixer.** At any moment, the game is composing music in real time by:

- **Zone position** — determines mix volume/panning (Front Row = loud/center, Back Line = quiet/reverb-washed)
- **Faction** — determines which stems are active and what key/mode the piece gravitates toward
- **Harmony Meter** — as a player loses Harmony, **their side of the music degrades** — goes out of tune, loses instruments, becomes cacophonous
- **Chord formation** — when a Chord Chain triggers, the music briefly swells with a full arrangement before settling back
- **Song cards played** — triggers one-shot musical events (a trumpet fanfare, a drum fill, a feedback screech)

The music would never be random — it would always reflect the current board state, so an experienced player could **hear** how the game is going.

## Remaining Design Work

- Power Chord abilities for each faction
- Discordant state specifics (stat penalties, duration)
- Specific card designs for each faction
- Song, Riff, and Venue card catalog
- Back Line "reduced damage" — how much reduction?
- Deck building restrictions (max copies of a card, faction mixing rules)
