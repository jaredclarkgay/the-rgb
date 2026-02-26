# CLAUDE.md — Space Tower (Sim)

## What This Is

Space Tower is a tower-building game where you ARE the builder — a physically strong human in a hardhat constructing a space elevator by hand. The game has four surfaces: the Exterior (third-person climbing/building on the tower's outside), the Sim (cross-section management view — this repo), the Restaurant (hunger refill + social space on floor 5), and the RGB (first-person LLM-powered immersive experience inside the restaurant). All four are views of the same tower, experienced by the same character.

This repo is **the Sim** — the resource management and tower interior layer. It's one of four pieces that together form the full game.

The first 10-floor segment is called "Goodbye Earth" and explores departure and loss.

---

## The Four Surfaces (Context)

The sim doesn't exist in isolation. Understanding its role in the larger structure matters for implementation decisions.

1. **The Exterior** (`space-tower-exterior`): Third-person, Three.js. You climb the tower's outside, place structural elements. The title screen's cinematic zoom lands here. This is where the player character lives physically.
2. **The Sim** (`space-tower`, this repo): Side-on cross-section. Canvas 2D. Manage the tower's interior — modules, resources, NPCs. The strategy layer.
3. **The Restaurant**: Floor 5 of every 10-floor segment. The player goes here because they're hungry. View transitions from sim cross-section to first-person 3D. This is the threshold into the RGB.
4. **The RGB** (`space-tower-rgb`): First-person, LLM-powered. The player connects their own LLM (BYOK) and talks to a real AI character inside the restaurant. The culmination of the player journey.

**Transitions relevant to this repo:**
- Exterior → Sim: Player climbs to a window/hatch, presses E. Camera pulls back to cross-section.
- Sim → Exterior: Player reaches roof or window. Camera pushes in, cross-section collapses, back to 3D exterior.
- Sim → Restaurant: Player walks to Floor 5 restaurant area. Cross-section dissolves into first-person 3D.
- Restaurant → Sim: Player stands up and leaves. Camera pulls back to cross-section.

Currently these transitions are page navigations with localStorage bridging state. Post-MVP they may become smoother.

---

## Tech Stack

**Vanilla JS + Canvas 2D.** No framework. No React (it's in package.json but unused — legacy from Vite scaffolding, safe to remove). Vite is the dev server and bundler only.

```
npm run dev    → starts Vite dev server
npm run build  → production bundle
```

---

## File Structure

```
src/
  state.js        (36 lines)  — Global state object S, zoom, resource engine
  constants.js    (31 lines)  — Dimensions, physics, seeded RNG, color lerp
  floors.js       (84 lines)  — 10 floor definitions, modules, themes, object/NPC data
  npcs.js         (95 lines)  — Name pools, appearance palettes, dialogue trees
  world.js        (49 lines)  — World generation (floors, stairs, objects, NPCs, suits, cranes)
  main.js        (154 lines)  — Game loop, player physics, elevator state machine, NPC AI
  render.js      (567 lines)  — THE BIG ONE. Sky, parallax, tower, characters, modules, prompts
  panel.js        (95 lines)  — Build panel (desktop + mobile), module placement/selling
  input.js        (27 lines)  — Keyboard + touch input, zoom slider
  save.js         (32 lines)  — localStorage save/load (key: spacetower_v9c)
  sound.js        (73 lines)  — Web Audio API synth, procedural SFX, ambient drone
  compendium.js  (205 lines)  — Character collection UI, mini-sprite renderer, dialogue log
index.html       (149 lines)  — All CSS (inline <style>), DOM structure, UI layout
```

Total: ~1450 lines JS + 149 lines HTML.

---

## Architecture

### State
Everything lives in a single mutable object `S` exported from `state.js`. No immutability, no reducers, no events. Functions read and write `S` directly.

Key state paths:
- `S.player` — position, velocity, state, appearance, hunger, political power
- `S.floors[]` — floor collision data (level, y position)
- `S.modules[floor][block]` — placed buildables (null = empty)
- `S.npcs[]` — all NPCs with position, type, dialogue, AI state
- `S.workers[]` — rooftop construction workers (separate from npcs)
- `S.res` — `{energy, credits, population}`
- `S.sat` — satisfaction (0–100)
- `S.cam` — camera position + target
- `S.litFloors` — Set of unlocked floor indices
- `S.compendium.entries` — discovered character data

### Game Loop
`requestAnimationFrame` → `update()` → `draw()` → `renderPanel()`

- `update()` in main.js: player physics, input processing, elevator state machine, NPC AI ticks, resource income/decay, hunger decay, political power recalculation
- `draw()` in render.js: sky → stars/moon/clouds → parallax city → parallax trees → ground → parking → scaffolding → tower floors → modules → stairs → objects → NPCs → player → interaction prompts
- `renderPanel()` in panel.js: resource display, floor grid, module cards (skips if `S.panelDirty` is false)

### World Generation
`genWorld()` in world.js. Uses seeded RNG (`sr()`, `ri()`, `pk()` from constants.js). Generates floors, stairs between floors, interactable objects, NPCs (4 types with weighted probability), suits, cranes, rooftop workers. Same seed = same layout.

### Rendering
Canvas 2D only. No sprites, no images. Everything is procedurally drawn with `fillRect`, `arc`, `ellipse`, `beginPath`.

The camera system uses `ctx.save()` / `ctx.translate()` / `ctx.scale()` / `ctx.restore()`. Parallax layers exit and re-enter the camera transform at different offsets:
- City skyline: 0.35x horizontal parallax
- Treeline: 0.6x horizontal parallax
- Tower + characters: 1x (main camera)

### UI Split
- **Canvas** for the game world (top 58% of viewport)
- **DOM** for the build panel (bottom 42%), elevator panel, compendium, HUD elements, messages
- On mobile: touch controls overlaid, build panel switches to tabbed layout

---

## Player-Level Resources (MVP Addition)

These are distinct from tower resources. They belong to the player character, not the building.

### Hunger
- Range: 0–100, starts full
- Decays at ~1 point per 15 seconds of active play (tunable)
- Refills to 100 when player eats at the Floor 5 restaurant
- At hunger < 30: movement slows slightly, screen edges dim
- At hunger = 0: significant movement penalty, vision narrows, political power tanks
- Never kills the player. Just makes everything harder.
- **Design purpose:** Creates a rhythmic pull toward Floor 5, which is where the RGB lives. The player goes to the restaurant because they're hungry, and while they're there, the RGB experience is available.

### Political Power
A composite stat representing how much the tower's population trusts and follows the player. Not a resource you spend — a multiplier that makes everything else work better or worse.

**Inputs (what raises/lowers it):**
- Hunger level: well-fed = bonus, starving = penalty
- Satisfaction: high morale = bonus, low = penalty
- NPC conversations: talking to people = small boost per unique interaction
- Module choices: amenity modules = bonus, pure industry = neutral/slight penalty
- Time since last restaurant visit: recency bonus that decays
- Floor presence: visiting floors = slow build (post-MVP)
- Compendium progress: knowing people = passive bonus (post-MVP)

**Outputs (what it affects):**
- Credit income: multiplier on base rate (high PP = up to 1.5x, low PP = down to 0.5x)
- Population productivity: same multiplier concept
- NPC dialogue access: low PP may gate third-line reveals (post-MVP)
- Floor funding cost: high PP = cheaper funding (post-MVP)

**MVP scope:** Implement hunger + satisfaction as inputs, credit multiplier as output. Display as explicit stat bar for playtesting. Can go subtle later.

---

## Key Systems

### The Block System
Each floor = 12 blocks. Block width = 300px (`PG`). Tower width = 3600px (`TW`).
- Blocks 3, 7, 11 are **windows** (unbuildable) → checked via `isWinBlock(bi)` → `(bi+1)%4===0`
- Block 6 is the **elevator shaft** → checked via `isElevBlock(bi)` → `bi===6`
- Remaining 9 blocks per floor accept modules

### Module System
Defined in `FD[]` (floors.js). Each module: `{id, nm, ic, col, cost:{credits,energy}, prod:{energy,population,credits}, sat, sell, desc, eff?}`. Placed into `S.modules[floorIndex][blockIndex]`. `recalc()` scans all modules and updates resource totals. Credit income is then modified by the political power multiplier.

### Floor Unlocking
Each floor (except Lobby and Quarters) has `unlock` requirements: energy, population, satisfaction thresholds. `canUnlock(fi)` checks current resources. Player clicks "Fund" in the panel → floor added to `S.litFloors`. High political power may reduce funding costs (post-MVP).

### Floor 5: The Restaurant
Floor 5 (RESTAURANT) has special significance. It's the hunger refill point and the RGB threshold. In the sim, it functions like any other floor (modules, NPCs). But when the player walks to a specific zone on Floor 5, the transition to the restaurant's 3D interior can trigger. This transition is a page navigation to the RGB app with state passed via localStorage.

### NPC Types
| Type | Code | Renderer | Features |
|------|------|----------|----------|
| Casual human | `c` | `drawCasual()` | genAppearance(), skin/hair/clothing variety, male/female |
| Business | `b` | `drawBiz()` | Suit palette, springy walk, jumping behavior |
| Construction worker | `w` | `drawWorker()` | Orange vest, hardhat, reflective stripes |
| Alien | `a` | `drawBlob()` | Single eye, antenna, bright saturated colors |

All NPCs have `convo` (array of 3 dialogue functions) and `ci` (conversation index). Press E to advance. Dialogue is sequential — greeting → context → the real thing. Political power may affect NPC openness (post-MVP).

### Character Drawing Conventions
- **Characters are flat.** Pure color fills, no gradients, no highlights. Deliberate aesthetic.
- **Modules are detailed.** Animated smoke, charge indicators, growing plants. The contrast between simple people and detailed infrastructure is intentional.
- Human characters have anatomical structure (legs, torso, arms, head, hair). Different proportions for male/female.
- Aliens are blobs with one eye.

### Elevator System
State machine in main.js: `idle` → `closing` → `traveling` (30 frames) → `opening` → `idle`. Player position teleported during `traveling` phase. Doors render as sliding panels.

### Satisfaction Decay
Ticks every 180 frames. Decay rate = `0.3 + litFloors * 0.15`. More floors = faster decay. This feeds into political power — if satisfaction tanks, so does your authority. "Goodbye Earth" expressed through mechanics.

### Save System
localStorage key: `spacetower_v9c`. Saves: module placements (as IDs), lit floors, credits, satisfaction, panel floor, compendium entries. Will need to save hunger and political power once implemented. Auto-saves every 3600 frames (~60 seconds). Also saves on module place/sell/fund.

Save data is also read by other surfaces (exterior, RGB) via localStorage for state bridging.

### Sound
Web Audio API oscillator synth. No audio files. `ensureAudio()` creates AudioContext on first user interaction. Procedural SFX: step, talk, place, sell, fund, warn, elevator. Ambient drone with altitude-aware frequency/filter modulation.

### Compendium
Character collection system. Talking to an NPC adds them to `S.compendium.entries`. UI shows mini canvas-rendered sprites, dialogue history, type filters. 36 total discoverable names. Compendium progress may feed into political power (post-MVP).

---

## Constants Reference

| Constant | Value | Meaning |
|----------|-------|---------|
| `TW` | 3600 | Tower width (px) |
| `FH` | 160 | Floor height (px) |
| `FT` | 12 | Floor slab thickness |
| `NF` | 10 | Number of floors |
| `PG` | 300 | Pillar gap / block width |
| `BPF` | 12 | Blocks per floor |
| `GY` | 2400 | Ground Y position |
| `UW` | 1400 | Underworld width (explorable area beyond tower) |
| `TL` / `TR` | -1800 / 1800 | Tower left/right edges |
| `TB` | 2400 | Tower bottom (= GY) |
| `TT` | 800 | Tower top |
| `ROOF_Y` | 800 | Rooftop Y (= TT) |
| `ELEV_X` | 150 | Elevator shaft center X |
| `GRAV` | 0.5 | Gravity per frame |
| `PH` | 0.42 | Panel height as viewport fraction |
| `MOB` | bool | Mobile device detection |

---

## Conventions

### Code Style
- Terse variable names for constants and state paths: `S`, `X` (canvas context), `C` (canvas), `TW`, `FH`, `PG`
- Descriptive names for functions: `drawCasual()`, `genAppearance()`, `canAfford()`
- Semicolons everywhere. Single quotes for strings.
- Dense formatting — multiple statements per line when they're short and related
- ES modules with named exports. No default exports.
- `'use strict'` at top of every file

### Rendering Pattern
Drawing functions receive bounds/entity, draw within margins. See `drawMod(id, bx, by, bw, bh)` for modules, `drawCasual(n)` / `drawBiz(n)` / `drawWorker(w)` / `drawBlob(c, isP, oneEye)` for characters.

### Adding a New Module
1. Add entry to the appropriate floor's `mods` array in `FD[]` (floors.js)
2. Add drawing case in `drawMod()` (render.js) — receives block bounds, draw within 6px margin
3. That's it. `recalc()`, panel rendering, save/load all work off `FD[]` automatically.

### Adding a New NPC Type
1. Add name pool and dialogue array to npcs.js
2. Add spawn logic with probability weight in `genWorld()` (world.js)
3. Add drawing function in render.js
4. Add to the NPC sorting/rendering section in `draw()` (render.js, lines ~534-546)
5. Add sprite variant in `_drawSprite()` (compendium.js)

### Adding Player-Level Resources
1. Add to `S.player` in state.js (e.g., `hunger: 100, pp: 50`)
2. Add decay/update logic in `update()` in main.js
3. Add display element in index.html + rendering in panel.js or render.js
4. Add to save/load format in save.js (bump save key version)
5. Wire any multiplier effects into `recalc()` or income tick in main.js

---

## What Not to Break

- The `S` object structure — everything reads it. Renaming fields breaks the game.
- `isWinBlock()` and `isElevBlock()` — guard all block placement logic
- Camera save/restore nesting in `draw()` — parallax layers depend on exact nesting order
- `recalc()` being called after any module change — resource display depends on it
- The seeded RNG sequence — changing generation order changes every world
- Save key format `spacetower_v9c` — changing it orphans existing saves (bump to v9d+ for new fields)
- Floor 5 as RESTAURANT — this is the RGB threshold, not just another floor

---

## Design Principles (for context, not enforcement)

- **Discovery over instruction.** No tutorials, no markers. If it needs explaining, redesign it.
- **Character dignity.** Every NPC is a person. Three-line conversations reveal layers: greeting → context → the real thing.
- **Flat characters, detailed infrastructure.** The contrast is intentional.
- **Satisfaction as theme.** Decay accelerates with altitude — the tower becomes harder to sustain the higher you go.
- **Hunger as rhythm.** The player's body pulls them toward the restaurant. The restaurant is where the RGB lives. Mechanical need becomes narrative gateway.
- **Political power as felt leadership.** The player's choices — what they build, who they talk to, whether they eat — determine how the tower responds to them.
- **The player is the builder.** Not a disembodied cursor. A person in a hardhat who built this thing with their hands, who gets hungry, who has standing among the people they brought to space.
- **BYOK as culmination.** The player earns the right to bring their own mind into the world by building it first.
