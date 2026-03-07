import type { Faction } from "../types/cards";

export const FACTION_COLORS: Record<Faction, string> = {
  winds: "#4ecdc4",
  percussion: "#ff6b35",
  strings: "#c9b037",
  electronic: "#a855f7",
  voice: "#f472b6",
};

export function injectStyles(): void {
  const style = document.createElement("style");
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #06060c;
      background-image:
        radial-gradient(ellipse at 15% 80%, rgba(78, 205, 196, 0.06) 0%, transparent 40%),
        radial-gradient(ellipse at 85% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 0%, rgba(201, 176, 55, 0.04) 0%, transparent 30%);
      color: #d8d8e8;
      font-family: 'Quicksand', 'Segoe UI', system-ui, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Subtle scanline texture overlay */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.03) 2px,
        rgba(0, 0, 0, 0.03) 4px
      );
      pointer-events: none;
      z-index: 999;
    }

    #app {
      max-width: 1000px;
      margin: 0 auto;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
    }

    /* ——— Header ——— */
    .header {
      text-align: center;
      padding: 12px 8px 10px;
      border-bottom: 1px solid rgba(201, 176, 55, 0.15);
      margin-bottom: 8px;
    }
    .header h1 {
      font-family: 'Audiowide', 'Segoe UI', sans-serif;
      font-size: 20px;
      color: #c9b037;
      letter-spacing: 6px;
      text-shadow:
        0 0 30px rgba(201, 176, 55, 0.4),
        0 0 60px rgba(201, 176, 55, 0.15);
    }
    .header {
      position: relative;
    }
    .header .phase-info {
      font-size: 12px;
      color: #6a6a8a;
      margin-top: 4px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .mute-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      border: 1px solid #2a2a44;
      border-radius: 6px;
      background: rgba(12, 12, 20, 0.8);
      color: #6a6a8a;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: all 0.15s;
    }
    .mute-btn:hover {
      background: #1a1a35;
      border-color: #4a4a66;
      color: #d0d0e0;
    }

    /* ——— Phase bar ——— */
    .phase-bar {
      display: flex;
      justify-content: center;
      gap: 3px;
      margin: 8px 0;
      flex-wrap: wrap;
    }
    .phase-step {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      background: rgba(12, 12, 20, 0.8);
      color: #3a3a55;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }
    .phase-step.active {
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(78, 205, 196, 0.05));
      color: #4ecdc4;
      font-weight: 700;
      border-color: rgba(78, 205, 196, 0.3);
      box-shadow:
        0 0 12px rgba(78, 205, 196, 0.2),
        inset 0 0 8px rgba(78, 205, 196, 0.05);
      text-shadow: 0 0 8px rgba(78, 205, 196, 0.4);
    }
    .phase-step.done { color: #2a2a40; }

    /* ——— Player area ——— */
    .player-area {
      border: 1px solid #15152a;
      border-radius: 12px;
      padding: 10px 12px;
      margin: 4px 0;
      background: linear-gradient(180deg, #0a0a16 0%, #0c0c1a 100%);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .player-area.active {
      border-color: rgba(78, 205, 196, 0.15);
      box-shadow: 0 0 20px rgba(78, 205, 196, 0.03);
    }
    .player-area.opponent { opacity: 0.85; }

    .player-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .player-name {
      font-family: 'Audiowide', sans-serif;
      font-size: 13px;
      color: #5a5a7a;
      letter-spacing: 1px;
    }
    .player-name.active-turn {
      color: #e0e0f0;
      text-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
    }

    /* ——— Harmony meter ——— */
    .harmony-meter {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
    }
    .harmony-bar {
      width: 130px;
      height: 8px;
      background: #0a0a14;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #1a1a2e;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
    }
    .harmony-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
      box-shadow: 0 0 6px currentColor;
    }
    .harmony-fill.high { background: linear-gradient(90deg, #3ab5a8, #4ecdc4); color: #4ecdc4; }
    .harmony-fill.mid { background: linear-gradient(90deg, #b89e2e, #c9b037); color: #c9b037; }
    .harmony-fill.low { background: linear-gradient(90deg, #e05a2a, #ff6b35); color: #ff6b35; }

    /* ——— Stage zones ——— */
    .stage {
      display: flex;
      gap: 6px;
      margin: 8px 0;
    }
    .zone {
      flex: 1;
      min-height: 85px;
      border: 1px dashed #1e1e35;
      border-radius: 10px;
      padding: 4px 5px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: rgba(10, 10, 20, 0.6);
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .zone-label {
      font-family: 'Audiowide', sans-serif;
      font-size: 8px;
      text-transform: uppercase;
      color: #2a2a44;
      text-align: center;
      letter-spacing: 1.5px;
    }
    .zone.drop-target {
      border-color: #4ecdc4;
      border-style: solid;
      background: rgba(78, 205, 196, 0.04);
      cursor: pointer;
      box-shadow:
        inset 0 0 25px rgba(78, 205, 196, 0.06),
        0 0 15px rgba(78, 205, 196, 0.08);
      animation: zone-pulse 2s ease-in-out infinite;
    }
    @keyframes zone-pulse {
      0%, 100% { box-shadow: inset 0 0 25px rgba(78, 205, 196, 0.06), 0 0 15px rgba(78, 205, 196, 0.08); }
      50% { box-shadow: inset 0 0 35px rgba(78, 205, 196, 0.1), 0 0 25px rgba(78, 205, 196, 0.12); }
    }

    /* ——— Deployed musician ——— */
    .deployed-musician {
      background: linear-gradient(135deg, #0e0e1e, #12122a);
      border: 1px solid #22223a;
      border-radius: 8px;
      padding: 6px 8px;
      font-size: 11px;
      cursor: default;
      position: relative;
      transition: all 0.2s ease;
      border-left: 3px solid var(--faction-color, #444);
    }
    .deployed-musician.discordant {
      opacity: 0.4;
      border-style: dashed;
      filter: saturate(0.3);
    }
    .deployed-musician.chord-member {
      box-shadow:
        0 0 10px rgba(201, 176, 55, 0.3),
        0 0 20px rgba(201, 176, 55, 0.1),
        inset 0 0 10px rgba(201, 176, 55, 0.05);
    }
    .deployed-musician.selectable {
      cursor: pointer;
      border-color: #4ecdc4;
      box-shadow: 0 0 10px rgba(78, 205, 196, 0.15);
    }
    .deployed-musician.selectable:hover {
      background: linear-gradient(135deg, #0e1e2a, #1a2a40);
      box-shadow: 0 0 18px rgba(78, 205, 196, 0.25);
    }
    .deployed-musician.attack-target {
      cursor: pointer;
      border-color: #ff6b35;
      box-shadow: 0 0 10px rgba(255, 107, 53, 0.15);
    }
    .deployed-musician.attack-target:hover {
      background: linear-gradient(135deg, #2a1210, #3a1a14);
      box-shadow: 0 0 18px rgba(255, 107, 53, 0.3);
    }
    .deployed-musician .name {
      font-weight: 700;
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #e0e0f0;
    }
    .deployed-musician .stats {
      display: flex;
      gap: 8px;
      font-size: 10px;
      color: #8888aa;
      margin-top: 3px;
      font-weight: 600;
    }
    .stat-vol { color: #ff6b35; }
    .stat-tone { color: #4ecdc4; }
    .stat-res { color: #c9b037; }
    .riff-indicator {
      font-size: 9px;
      color: #a855f7;
      margin-top: 2px;
      font-weight: 600;
    }

    /* ——— Tone bar (health) ——— */
    .tone-bar {
      width: 100%;
      height: 3px;
      background: #0a0a14;
      border-radius: 2px;
      margin-top: 4px;
      overflow: hidden;
    }
    .tone-bar-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.4s ease;
      box-shadow: 0 0 4px currentColor;
    }

    /* ——— Soundcheck display ——— */
    .soundcheck-area {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      font-size: 11px;
      font-weight: 600;
      color: #6a6a8a;
    }
    .soundcheck-dots {
      display: flex;
      gap: 4px;
    }
    .soundcheck-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1.5px solid #333;
      transition: all 0.3s ease;
    }
    .soundcheck-dot.available {
      background: #4ecdc4;
      border-color: #4ecdc4;
      box-shadow: 0 0 6px rgba(78, 205, 196, 0.4);
    }
    .soundcheck-dot.tapped {
      background: #151520;
      border-color: #2a2a40;
    }

    /* ——— Hand ——— */
    .hand-area {
      margin: 8px 0;
    }
    .hand-label {
      font-family: 'Audiowide', sans-serif;
      font-size: 10px;
      color: #3a3a55;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .hand {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      padding: 10px 20px 30px;
      min-height: 280px;
    }
    .hand > .card {
      margin-right: var(--overlap, -60px);
      transition: transform 0.25s ease, margin 0.25s ease, border-color 0.2s, box-shadow 0.2s;
      z-index: 0;
    }
    .hand > .card:last-child { margin-right: 0; }
    .hand > .card:hover {
      transform: translateY(-20px) scale(1.08);
      z-index: 10;
      margin-left: 15px;
      margin-right: 15px;
    }
    .hand > .card:hover:first-child { margin-left: 0; }
    .hand > .card:hover:last-child { margin-right: 0; }

    /* ——— Cards ——— */
    .card {
      width: 150px;
      min-width: 150px;
      min-height: 240px;
      border: 2px solid #2a2a45;
      border-radius: 10px;
      padding: 0;
      background: linear-gradient(180deg, #12121f 0%, #0a0a14 100%);
      font-size: 11px;
      cursor: pointer;
      transition: transform 0.25s ease, margin 0.25s ease, border-color 0.2s, box-shadow 0.2s;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      border-top: 3px solid var(--faction-color, #444);
    }
    .card:hover {
      transform: translateY(-8px) scale(1.02);
      border-color: var(--faction-color, #3a3a55);
      box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.6),
        0 0 20px color-mix(in srgb, var(--faction-color) 20%, transparent);
    }
    .card.unplayable {
      opacity: 0.3;
      cursor: default;
      filter: saturate(0.3);
    }
    .card.unplayable:hover {
      transform: none;
      border-color: #2a2a45;
      box-shadow: none;
    }
    .card.selected {
      transform: translateY(-12px);
      z-index: 5;
      border-color: #4ecdc4;
      box-shadow:
        0 0 20px rgba(78, 205, 196, 0.25),
        0 0 40px rgba(78, 205, 196, 0.08);
    }

    /* Card header: name + cost pips */
    .card .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px 4px;
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%);
    }
    .card .card-name {
      font-family: 'Audiowide', sans-serif;
      font-weight: 400;
      font-size: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #e8e8f8;
      flex: 1;
      min-width: 0;
    }
    .card .card-cost-pips {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
      margin-left: 4px;
    }
    .card .cost-pip {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #f0d060, #c9b037);
      border: 1px solid rgba(201, 176, 55, 0.6);
      box-shadow: 0 0 4px rgba(201, 176, 55, 0.3);
    }

    /* Card art window */
    .card .card-art {
      width: calc(100% - 10px);
      height: 130px;
      margin: 0 5px;
      border-radius: 4px;
      background-size: cover;
      background-position: center center;
      border: 1px solid #2a2a45;
    }
    .card .card-art-placeholder {
      background: linear-gradient(135deg, #1a1a30 0%, #0e0e1c 50%, #1a1a30 100%);
    }

    /* Card info bar: badge + faction */
    .card .card-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 8px 2px;
    }
    .card .card-faction {
      font-size: 8px;
      text-transform: uppercase;
      color: var(--faction-color, #4a4a6a);
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .card .card-badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 7px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .card .card-badge.musician {
      background: rgba(78, 205, 196, 0.12);
      color: #4ecdc4;
      border: 1px solid rgba(78, 205, 196, 0.2);
    }
    .card .card-badge.song {
      background: rgba(244, 114, 182, 0.12);
      color: #f472b6;
      border: 1px solid rgba(244, 114, 182, 0.2);
    }
    .card .card-badge.riff {
      background: rgba(168, 85, 247, 0.12);
      color: #a855f7;
      border: 1px solid rgba(168, 85, 247, 0.2);
    }
    .card .card-badge.venue {
      background: rgba(201, 176, 55, 0.12);
      color: #c9b037;
      border: 1px solid rgba(201, 176, 55, 0.2);
    }

    /* Card stats row */
    .card .card-stats {
      display: flex;
      justify-content: center;
      gap: 6px;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 700;
    }
    .card .card-stats .stat-vol { color: #ff6b35; }
    .card .card-stats .stat-tone { color: #4ecdc4; }
    .card .card-stats .stat-tempo { color: #c9b037; }
    .card .card-stats .stat-range { color: #7878a0; font-size: 8px; align-self: center; }
    .card .card-stats .stat-res { color: #a855f7; }

    /* Card description */
    .card .card-desc {
      font-size: 8px;
      color: #6a6a8a;
      padding: 2px 8px 6px;
      line-height: 1.3;
      font-style: italic;
    }

    /* ——— Action buttons ——— */
    .action-bar {
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
      padding: 12px 0;
    }
    .action-btn {
      padding: 9px 22px;
      border: 1px solid #2a2a44;
      border-radius: 8px;
      background: linear-gradient(180deg, #12122a, #0e0e1e);
      color: #9898b8;
      font-family: 'Quicksand', sans-serif;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }
    .action-btn:hover {
      background: linear-gradient(180deg, #1a1a35, #151528);
      border-color: #4a4a66;
      color: #d0d0e0;
    }
    .action-btn:active {
      transform: scale(0.97);
    }
    .action-btn.primary {
      background: linear-gradient(180deg, #1a3830, #153028);
      border-color: rgba(78, 205, 196, 0.5);
      color: #4ecdc4;
      box-shadow:
        0 0 15px rgba(78, 205, 196, 0.12),
        inset 0 1px 0 rgba(78, 205, 196, 0.1);
    }
    .action-btn.primary:hover {
      background: linear-gradient(180deg, #224840, #1a3830);
      box-shadow:
        0 0 25px rgba(78, 205, 196, 0.2),
        inset 0 1px 0 rgba(78, 205, 196, 0.15);
      color: #6eeae0;
    }

    .instruction-text {
      font-size: 11px;
      color: #6a6a8a;
      font-weight: 600;
    }
    .instruction-text.discard-warning {
      color: #ff6b35;
    }

    /* ——— Pending attacks ——— */
    .pending-attacks-box {
      padding: 8px 12px;
      border: 1px solid #1e1e35;
      border-radius: 8px;
      margin: 6px 0;
      background: rgba(10, 10, 18, 0.8);
    }
    .pending-attacks-box .pending-label {
      font-family: 'Audiowide', sans-serif;
      font-size: 9px;
      color: #3a3a55;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .pending-attacks-box .pending-entry {
      font-size: 11px;
      color: #8888aa;
      padding: 2px 0;
      font-weight: 600;
    }

    /* ——— Stat summary ——— */
    .stat-summary {
      font-size: 10px;
      color: #2e2e48;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    /* ——— Venue banner ——— */
    .venue-banner {
      text-align: center;
      font-family: 'Audiowide', sans-serif;
      font-size: 11px;
      color: #c9b037;
      padding: 6px 14px;
      background: rgba(201, 176, 55, 0.04);
      border: 1px solid rgba(201, 176, 55, 0.12);
      border-radius: 8px;
      margin: 4px 0;
      letter-spacing: 1px;
      text-shadow: 0 0 10px rgba(201, 176, 55, 0.2);
    }

    /* ——— Game log ——— */
    .game-log {
      border-top: 1px solid #12122a;
      margin-top: 10px;
      padding-top: 8px;
      max-height: 140px;
      overflow-y: auto;
      font-size: 11px;
    }
    .game-log::-webkit-scrollbar { width: 4px; }
    .game-log::-webkit-scrollbar-track { background: transparent; }
    .game-log::-webkit-scrollbar-thumb { background: #1e1e35; border-radius: 2px; }
    .game-log .log-entry {
      padding: 2px 0;
      color: #3e3e5a;
    }
    .game-log .log-entry .log-player {
      font-weight: 700;
      color: #5a5a7a;
    }

    /* ——— Win screen ——— */
    .win-overlay {
      position: fixed;
      inset: 0;
      background: rgba(4, 4, 10, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      animation: win-fade-in 0.5s ease;
    }
    @keyframes win-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .win-panel {
      text-align: center;
      padding: 52px 60px;
      background: linear-gradient(180deg, #10102a, #0a0a18);
      border: 2px solid #c9b037;
      border-radius: 20px;
      box-shadow:
        0 0 80px rgba(201, 176, 55, 0.15),
        0 0 160px rgba(201, 176, 55, 0.05),
        inset 0 0 40px rgba(201, 176, 55, 0.03);
      animation: win-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
    }
    .win-panel::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 22px;
      background: conic-gradient(from 0deg, transparent, rgba(201, 176, 55, 0.3), transparent, rgba(78, 205, 196, 0.2), transparent);
      z-index: -1;
      animation: win-rotate 4s linear infinite;
    }
    @keyframes win-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes win-pop {
      0% { transform: scale(0.7); opacity: 0; }
      60% { transform: scale(1.04); }
      100% { transform: scale(1); opacity: 1; }
    }
    .win-panel h2 {
      font-family: 'Audiowide', sans-serif;
      font-size: 36px;
      color: #c9b037;
      margin-bottom: 10px;
      text-shadow:
        0 0 30px rgba(201, 176, 55, 0.5),
        0 0 60px rgba(201, 176, 55, 0.2);
      letter-spacing: 3px;
    }
    .win-panel p {
      color: #6a6a8a;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .win-panel .win-stats {
      font-size: 12px;
      color: #3e3e5a;
      margin-bottom: 24px;
      font-weight: 600;
    }

    /* ——— Start screen ——— */
    .start-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 85vh;
      gap: 28px;
    }
    .start-title-area {
      text-align: center;
      position: relative;
    }
    .start-title-area::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 100px;
      background: radial-gradient(ellipse, rgba(201, 176, 55, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .start-screen h1 {
      font-family: 'Audiowide', sans-serif;
      font-size: 48px;
      color: #c9b037;
      letter-spacing: 8px;
      text-shadow:
        0 0 40px rgba(201, 176, 55, 0.4),
        0 0 80px rgba(201, 176, 55, 0.15),
        0 2px 0 rgba(0, 0, 0, 0.3);
      position: relative;
    }
    .start-screen h2 {
      font-family: 'Audiowide', sans-serif;
      font-size: 13px;
      color: #4a4a6a;
      font-weight: 400;
      letter-spacing: 4px;
      margin-top: 6px;
    }
    .start-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }
    .start-form input {
      padding: 11px 18px;
      background: #0a0a18;
      border: 1px solid #1e1e35;
      border-radius: 8px;
      color: #d8d8e8;
      font-family: 'Quicksand', sans-serif;
      font-size: 14px;
      font-weight: 600;
      width: 260px;
      text-align: center;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .start-form input::placeholder { color: #2e2e48; }
    .start-form input:focus {
      outline: none;
      border-color: rgba(78, 205, 196, 0.4);
      box-shadow: 0 0 15px rgba(78, 205, 196, 0.08);
    }

    /* ——— Turn transition ——— */
    .turn-transition {
      position: fixed;
      inset: 0;
      background: rgba(4, 4, 10, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 90;
      cursor: pointer;
    }
    .turn-transition-content {
      text-align: center;
    }
    .turn-transition-content h2 {
      font-family: 'Audiowide', sans-serif;
      font-size: 28px;
      color: #e0e0f0;
      margin-bottom: 14px;
      letter-spacing: 2px;
    }
    .turn-transition-content p {
      color: #4a4a6a;
      font-size: 13px;
      font-weight: 600;
    }

    /* ——— Card detail overlay ——— */
    .card-detail-overlay {
      position: fixed;
      inset: 0;
      background: rgba(4, 4, 10, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 80;
      cursor: pointer;
    }
    .card-detail {
      background: #0c0c1a;
      border: 2px solid #2a2a44;
      border-radius: 14px;
      padding: 22px;
      min-width: 260px;
      max-width: 320px;
    }
    .card-detail .card-name {
      font-size: 18px;
      font-weight: 700;
      color: #e8e8f8;
    }
    .card-detail .card-type {
      font-size: 11px;
      text-transform: uppercase;
      color: #5a5a7a;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .card-detail .card-stats { font-size: 13px; margin: 10px 0; }
    .card-detail .card-desc { font-size: 12px; color: #7878a0; line-height: 1.6; }

    /* ——— AI thinking banner ——— */
    .ai-thinking-banner {
      text-align: center;
      padding: 10px;
      background: rgba(168, 85, 247, 0.06);
      border: 1px solid rgba(168, 85, 247, 0.2);
      border-radius: 10px;
      margin: 6px 0;
      font-family: 'Audiowide', sans-serif;
      font-size: 12px;
      color: #a855f7;
      letter-spacing: 1px;
      animation: ai-pulse 1.8s ease-in-out infinite;
    }
    @keyframes ai-pulse {
      0%, 100% { opacity: 0.6; box-shadow: 0 0 10px rgba(168, 85, 247, 0.05); }
      50% { opacity: 1; box-shadow: 0 0 20px rgba(168, 85, 247, 0.1); }
    }

    /* ——— Tutorial tooltip ——— */
    .tutorial-tooltip {
      position: relative;
      background: linear-gradient(135deg, #0c1a25, #101e2e);
      border: 1px solid rgba(78, 205, 196, 0.4);
      border-radius: 12px;
      padding: 14px 18px;
      margin: 10px 0;
      font-size: 13px;
      color: #d0e0e8;
      line-height: 1.5;
      font-weight: 600;
      box-shadow:
        0 0 30px rgba(78, 205, 196, 0.1),
        inset 0 0 20px rgba(78, 205, 196, 0.03);
      z-index: 70;
    }
    .tutorial-tooltip .tutorial-text {
      margin-bottom: 10px;
    }
    .tutorial-tooltip .tutorial-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .tutorial-tooltip .tutorial-actions button {
      padding: 5px 14px;
      border-radius: 6px;
      font-family: 'Quicksand', sans-serif;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid #2a2a44;
      background: #0e0e1e;
      color: #9898b8;
      transition: all 0.15s;
    }
    .tutorial-tooltip .tutorial-actions button.primary {
      background: linear-gradient(180deg, #1a3830, #153028);
      border-color: rgba(78, 205, 196, 0.4);
      color: #4ecdc4;
    }
    .tutorial-tooltip .tutorial-actions button:hover {
      background: #1a1a35;
      color: #d0d0e0;
    }

    /* ——— Tutorial highlight pulse ——— */
    [data-tutorial-highlight] {
      position: relative;
      z-index: 60;
      box-shadow: 0 0 0 3px #4ecdc4, 0 0 25px rgba(78, 205, 196, 0.35) !important;
      animation: tutorial-highlight-pulse 1.8s ease-in-out infinite;
    }
    @keyframes tutorial-highlight-pulse {
      0%, 100% { box-shadow: 0 0 0 3px #4ecdc4, 0 0 25px rgba(78, 205, 196, 0.35); }
      50% { box-shadow: 0 0 0 3px #4ecdc4, 0 0 40px rgba(78, 205, 196, 0.5); }
    }

    /* ——— Mode selection buttons ——— */
    .mode-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
      width: 100%;
      align-items: center;
    }
    .mode-btn {
      padding: 14px 36px;
      border: 1px solid #1e1e35;
      border-radius: 10px;
      background: linear-gradient(180deg, #0c0c1a, #08080f);
      color: #8888aa;
      font-family: 'Quicksand', sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 300px;
      text-align: center;
    }
    .mode-btn:hover {
      background: linear-gradient(180deg, #12122a, #0e0e1e);
      border-color: rgba(78, 205, 196, 0.3);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
      color: #c0c0e0;
    }
    .mode-btn.primary {
      background: linear-gradient(180deg, #0e2420, #0a1c18);
      border-color: rgba(78, 205, 196, 0.35);
      color: #4ecdc4;
      font-size: 16px;
      box-shadow: 0 0 20px rgba(78, 205, 196, 0.08);
    }
    .mode-btn.primary:hover {
      background: linear-gradient(180deg, #143830, #0e2820);
      box-shadow: 0 8px 30px rgba(78, 205, 196, 0.15);
      color: #6eeae0;
    }
    .mode-btn .mode-desc {
      font-size: 10px;
      color: #3a3a55;
      margin-top: 4px;
      font-weight: 600;
    }

    /* ——— Skip tutorial button ——— */
    .tutorial-skip-btn {
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 5px 14px;
      border: 1px solid #2a2a44;
      border-radius: 6px;
      background: #0c0c1a;
      color: #4a4a6a;
      font-family: 'Quicksand', sans-serif;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      z-index: 80;
      transition: all 0.15s;
    }
    .tutorial-skip-btn:hover {
      background: #12122a;
      color: #d0d0e0;
      border-color: #4a4a66;
    }
  `;
  document.head.appendChild(style);
}
