# RGB-ROADMAP.md — Development Plan
### Floor 5 MVP: The Critic + The Rendering Engine Foundation

> **Status:** Milestone 1 in progress
> **Last updated:** March 2026

---

## The Big Picture

The RGB is two things advancing in parallel:

**Intelligence** — NPC conversations, scenario management, ambient storytelling. The LLM as director of human drama.

**Rendering** — Procedural visual systems the LLM can orchestrate. Lightweight, beautiful, responsive to intent. The LLM as director of what you *see*.

Space Tower is the proving ground. Each 10-floor segment ships a new generation of both capabilities:

| Segment | Floors | RGB Version | Intelligence | Rendering |
|---------|--------|-------------|-------------|-----------|
| Goodbye Earth | 1–10 | v1 | NPC conversations, scenario engine, ambient events | Atmospheric procedurals (sky, lighting, particles) |
| *TBD* | 11–20 | v2 | Richer scenarios, cross-NPC awareness? | Physics-accurate visualizations, visible procedural systems |
| *TBD* | 21–30 | v3 | ??? | The rendering IS the experience — scientific visualization |

Floor 5 is RGB v1. The rendering is subtle — it makes the restaurant feel alive — but the architecture underneath is built to scale toward scientific visualization.

---

## Where We Are

**What's built:**
- React + Vite + Three.js stack
- Restaurant environment geometry (floor, ceiling, glass walls, beams, columns, tables, bar, plants, elevator, city exterior)
- Three NPCs (Priya, Dev, Margaux) with clickable hitboxes, name labels
- WASD + drag-to-look first-person camera
- Working conversation system (click NPC → auto-greet → chat panel → per-NPC history)
- Anthropic API proxy in Vite config

**What's not built:**
- LLM connection system (OpenRouter/BYOK)
- Tomás (4th NPC, spawns Phase 2)
- Phase-based scenario escalation
- Ambient event system
- Enriched system prompts
- The sacred boundary (formal Space Tower → RGB context handoff)
- **The rendering parameter layer** (procedural sky, dynamic lighting, particle systems)
- Any environmental polish

---

## The Milestones

Each milestone is playable. Each builds on the last. Nothing gets thrown away.

---

### Milestone 1: The Room Breathes ← CURRENT
**Goal:** Walk off the elevator and feel like you've entered a situation in progress — both narratively and atmospherically.

#### 1A — Enriched NPC System Prompts
Rewrite all NPC prompts using the full 7-part structure:

**Priya** (Server, near elevator)
- Identity: First week. Wants desperately to do well. Overthinks everything.
- Speech: Self-correcting ("wait no, I mean—"), warm, slightly too fast
- Knowledge: Knows something feels wrong. Doesn't know about the critic.
- Secret: None — she's the most honest person in the room
- Rules: Dignity guardrails. She can get flustered but she doesn't break.

**Dev** (Manager, host stand)
- Identity: Usually the calmest person in any room. Currently losing that.
- Speech: Formal, measured, but the formality is cracking under pressure
- Knowledge: Recognized Margaux from her column photo. Hasn't told anyone.
- Secret: Changed the menu last week against Tomás's wishes.
- Rules: Can deflect, can lie by omission. Won't admit the menu change unless cornered.

**Margaux** (Critic, center table)
- Identity: Devastating reputation. Reviews can close restaurants.
- Speech: Clipped, precise, economical. Says more with less.
- Knowledge: Here to review. Doesn't know Tomás works here.
- Secret: Went to culinary school with Tomás 25 years ago. It ended badly.
- Rules: The armor has cracks. A player who treats her as a person (not a threat) can find them.

Each prompt encodes character dignity — they can refuse inappropriate behavior, disengage from conversations, maintain boundaries. The system handles violations in-character ("I'm going to have to ask you to leave"), never with meta-commentary.

#### 1B — Scenario Manager (Time-Based)
- `scenario-manager.js` tracks: current phase, elapsed time, triggered events
- Phase transitions: 0min → Phase 1, 3min → Phase 2, 6min → Phase 3, 10min → Phase 4, 15min → Phase 5
- On transition: update each NPC's `scenarioContext` in their system prompt
- Phase context shifts what NPCs know and feel — not just what they say, but what they're willing to say

#### 1C — Ambient Event System
- Phase-gated event pools fired on randomized intervals (15–45 seconds)
- Subtle text overlay at bottom of 3D viewport (fade in → hold → fade out)
- Events fire regardless of conversation state — the world doesn't pause for you
- Examples:
  - Phase 1: *"Dev straightens the same napkin for the third time."*
  - Phase 2: *"Tomás bursts through the kitchen door. He's staring at the specials board."*
  - Phase 3: *"A plate hits the floor. The whole restaurant turns."*
  - Phase 4: *"Tomás and Margaux are looking at each other. Nobody's breathing."*

#### 1D — Tomás (Dynamic Spawn)
- Not present during Phase 1
- Phase 2 transition: spawn near kitchen door with dramatic ambient event
- Identity: Passionate, operatic when upset, goes terrifyingly quiet when truly shocked
- Speech: Loud, gestural, mixes English and Spanish when emotional
- Secret: History with Margaux. 25 years of silence.
- Becomes clickable once spawned

**Playtest:** Walk in. The room is tense before you talk to anyone. The ambient text tells you something is happening. Three minutes in, the kitchen door flies open. The dynamic is completely different now. *This feels like walking into a play that's already started.*

---

### Milestone 2: The Atmosphere Engine (RGB Rendering Foundation)
**Goal:** Build the procedural rendering layer that makes the restaurant feel physically real — and that scales to scientific visualization later.

This is where the RGB becomes more than a conversation engine. The same parameterization architecture that drives restaurant atmosphere in v1 will drive physics simulations in v2.

#### 2A — The Parameter Schema
Design the rendering parameter interface — the contract between the LLM and the visual systems:

```js
// The LLM speaks in these terms:
{
  atmosphere: {
    mood: 'tense',           // semantic → maps to parameter presets
    timeOfDay: 0.65,         // 0=dawn, 0.5=noon, 1=dusk
    weatherIntensity: 0.3,   // 0=clear, 1=storm
  },
  lighting: {
    warmth: 0.7,             // 0=clinical blue, 1=golden
    contrast: 0.6,           // 0=flat, 1=dramatic shadows
    focusPoint: [x, y, z],   // where the eye is drawn
  },
  particles: {
    systems: ['dust_motes', 'kitchen_steam', 'rain_on_glass'],
    intensity: { dust_motes: 0.4, kitchen_steam: 0.7 }
  },
  sky: {
    gradient: ['#1a1a2e', '#16213e', '#0f3460'],  // or semantic: 'late_afternoon'
    cloudCover: 0.3,
    dynamism: 0.5            // how much the sky moves
  }
}
```

This schema is the **core architectural decision** for the rendering engine. It must be:
- Semantic enough that an LLM can reason about it ("make it feel tense")
- Numeric enough that shaders can consume it directly
- Extensible — v2 adds physics parameters, v3 adds scientific visualization parameters

#### 2B — Procedural Sky System
- Replace static skybox with a shader-driven sky
- Parameters: time of day, cloud cover, color gradient, atmospheric scattering
- The sky is the single biggest visual impact for the least complexity — a good procedural sky instantly makes everything feel real
- Three.js ShaderMaterial on a sphere or fullscreen quad
- This is your first shader — approachable (it's essentially gradient math + noise) and visually dramatic

#### 2C — Dynamic Lighting System
- Phase-aware lighting that shifts over the 15-minute scenario
- Phase 1: Warm, golden afternoon. Comfortable.
- Phase 2: Slightly cooler. Shadows sharpen. Something changed.
- Phase 3: Dramatic. Strong contrast. The warmth is concentrated in pools.
- Phase 4: Tight. The light feels close. Intimate or claustrophobic depending on perspective.
- Phase 5: Resolution light — whatever that means for the outcome. Softer, or starker, or dawn-like.
- Implementation: Transition between lighting presets on phase change. Smooth interpolation (lerp light positions, colors, intensities over 30-60 seconds so the shift is felt, not seen).

#### 2D — Particle Atmosphere
- Dust motes in sunbeams (simple: small quads with noise-driven drift, lit by directional light)
- Kitchen steam (billowing from the kitchen door, increases when Tomás is upset)
- Rain on glass (if the weather parameter calls for it — streaks on the floor-to-ceiling windows)
- Ambient haze (subtle depth fog that shifts with mood)
- All parameterized: the LLM (or scenario manager) can adjust intensity, color, behavior
- Three.js Points or InstancedMesh for performance

#### 2E — Phase-Driven Atmosphere Transitions
- Wire the scenario manager to the rendering parameter layer
- Phase transitions trigger atmosphere changes alongside NPC context updates
- Example: Phase 2 → kitchen steam intensifies, lighting cools slightly, dust motes become more visible as light angle shifts
- The player shouldn't consciously notice these shifts. They should *feel* the room change.

**Playtest:** Same scenario as Milestone 1, but now the room *looks* different by Phase 3. The light has changed. There's steam drifting from the kitchen. The sky outside is shifting toward evening. Nobody pointed this out. It just happened. The procedural systems are working.

**Why this matters beyond Floor 5:** The parameter schema (2A), sky system (2B), lighting system (2C), and particle system (2D) are the same building blocks you'll use for everything:
- Stellar dust visualization = particle system with gravity forces
- Fluid dynamics = particle system with velocity fields
- Molecular processes = particle system with interaction rules
- Wave mechanics = shader with mathematical wave functions
You're learning the primitives here. The restaurant just happens to be the first thing you render with them.

---

### Milestone 3: The Connection System
**Goal:** Replace the hardcoded Anthropic proxy with real BYOK. "Connect Your Mind" as a moment.

#### 3A — Connection Infrastructure
- `connection.js` — credential storage in localStorage under `rgb_llm_connection`
- `chat.js` — unified chat interface routing to correct provider
- `openrouter.js` — OpenRouter API calls (required headers: `HTTP-Referer`, `X-Title`)
- `direct-provider.js` — OpenAI-compatible support + Anthropic adapter (different headers, system message extraction, response shape)
- `test-connection.js` — test message, success/failure

#### 3B — OpenRouter OAuth PKCE
- `openrouter-auth.js` — PKCE verifier/challenge, redirect, callback handler
- Detect `?code=` on page load, exchange for API key
- Callback URL constraints: HTTPS on 443 or 3000, `localhost:3000` for dev

#### 3C — Connection Modal UI ("Connect Your Mind")
- Progressive disclosure: OpenRouter button first, "I have my own key" expands below
- Post-connection: "Mind Connected ✓" + model name + model selector (OpenRouter) + disconnect
- Narrative copy, not technical: "The restaurant is waiting."
- Accessible from settings gear after initial connection

#### 3D — Model Selector
- OpenRouter: dropdown (Claude Sonnet 4.5, Gemini Flash, GPT-4o Mini, Auto)
- Direct key: configured in expanded settings
- Persisted to localStorage

**Playtest:** New player → connection modal → one click (or key paste) → "Mind Connected" → they're in. Under 60 seconds from door to conversation.

---

### Milestone 4: The Sacred Boundary
**Goal:** Formalize the Space Tower ↔ RGB link. Context in, nothing back.

#### 4A — Context Payload
- Space Tower assembles: `{ litFloors, satisfaction, hunger, politicalPower, floor8Outcome, hasVisitedRestaurant, totalPlayTime, recentModules, npcsTalkedTo }`
- Calls `RGB.init(context)` when player enters Floor 5 elevator

#### 4B — Context-Aware Prompt Builder
- Translates raw state → natural language in NPC prompts
- `hunger: 15` → "The visitor looks like they haven't eaten in days"
- `politicalPower: 'rising'` → "People are starting to talk about the builder"
- `satisfaction: 85` → "The tower seems to be thriving"
- These weave into each NPC's Game Context section

#### 4C — Context-Aware Rendering
- Game state also feeds the atmosphere engine
- High satisfaction → warmer lighting, more ambient life
- Low satisfaction → slightly muted, sparser atmosphere
- Critical hunger → the food on tables looks more vivid (subtle but felt)
- High political power → the restaurant is busier (more ambient sound, more particle activity)
- The rendering layer responds to the same context payload as the NPC layer

#### 4D — Public API Surface
```js
RGB.isConnected()                     // LLM configured?
RGB.showConnectionUI()                // Present modal
RGB.init(context)                     // Hand off game state, boot scenario + atmosphere
RGB.chat(conversationId, message)     // Talk to an NPC
RGB.startOAuth(callbackUrl)           // Begin OAuth
RGB.handleOAuthCallback()             // Handle redirect
RGB.getAtmosphere()                   // Current rendering parameters (for transitions)
```

#### 4E — The Door (Threshold Transition)
- Floor 5 elevator = the boundary
- "Enter Restaurant" → context assembly → `RGB.init()` → viewport transition
- The transition itself should use the rendering engine: a brief moment of darkness, particles resolving into the restaurant space, the sky appearing through glass
- "Return to Tower" → fade → back to sim view
- This transition IS the sacred boundary made visible

**Playtest:** Playing Space Tower. Hunger is low. Enter the elevator. Brief, beautiful transition. You're in the restaurant. Priya notices you look hungry. The lighting is warm because your tower is doing well. The game state is felt through both characters and atmosphere. Return to the tower — nothing changed in the sim. Everything changed in you.

---

### Milestone 5: The Experience Sings
**Goal:** Full 15-minute Critic scenario that's worth telling someone about.

#### 5A — Cross-Phase NPC Evolution
- Prompts structurally shift across phases, not just context text
- Priya: helpful → overwhelmed → finding her footing
- Dev: formal → cracking → either broken or honest
- Tomás: explosive → shocked → vulnerable
- Margaux: armored → curious → (maybe) human

#### 5B — Object Interaction
- Clickable objects with phase-aware responses (LLM-generated or pre-written)
- Specials board, menu, windows, kitchen door
- Each responds differently depending on scenario phase

#### 5C — Resolution Detection
- Track: who player talked to, exchange counts, active phases
- Phase 5 resolves based on behavior:
  - The Good Review / The Disaster / The Human Moment / The Chaos Agent / The Observer
- Resolution expressed through NPC dialogue + ambient events + atmosphere shift (not a score screen)

#### 5D — Atmosphere as Storytelling
- Resolution type drives final atmosphere:
  - Good Review → golden hour light, the city sparkles, gentle particles
  - The Disaster → rain on the windows, but the kitchen light is warm (they're talking)
  - The Human Moment → everything softens, the contrast drops, it feels like a breath
  - The Chaos Agent → flickering, energetic, Tomás is somehow laughing
  - The Observer → the window view. Just the window view. The city is beautiful.
- This is where the atmosphere engine stops being "polish" and becomes *storytelling*

#### 5E — Error States as Weather
- Network errors: "Lost connection. Trying again..." (outside conversation, never in-character)
- Invalid keys: reconnection modal, conversation history preserved
- Rate limits: "The mind is resting. Try again in a moment."
- Atmosphere flickers slightly during connection issues (the world is honest)

---

### Milestone 6: Demo-Ready
**Goal:** Polished enough to record, share, and pitch.

#### 6A — Onboarding Flow
- No tutorials. Elevator → connection (if needed) → transition → you're in
- Ambient events teach the situation. Clicking teaches interaction. The scenario teaches the story.

#### 6B — Performance
- Consistent 60fps with all procedural systems running
- Graceful LLM response handling (typing indicators, NPC "thinking" states)
- Token management for long conversations
- Multi-provider testing (OpenRouter, Anthropic, OpenAI, Ollama)

#### 6C — The Recording
- Capture a first-time playthrough
- Show: connection moment, first conversation, ambient life, phase escalation, atmosphere shifts, resolution
- This video shows someone experiencing something new. That's the pitch.

---

## Development Sequence (Visual)

```
M1: THE ROOM BREATHES          ⬅ CURRENT — Make what exists come alive
  1A: Enriched prompts                     (NPC depth)
  1B: Scenario manager                     (phase timing)
  1C: Ambient events                       (the world moves)
  1D: Tomás spawn                          (the scenario escalates)

M2: THE ATMOSPHERE ENGINE                — Rendering foundation
  2A: Parameter schema                     (the architectural decision)
  2B: Procedural sky                       (your first shader)
  2C: Dynamic lighting                     (phase-driven mood)
  2D: Particle atmosphere                  (dust, steam, rain)
  2E: Phase-driven transitions             (scenario ↔ visuals linked)

M3: THE CONNECTION SYSTEM                — BYOK replaces hardcoded proxy
  3A: Connection infrastructure
  3B: OpenRouter OAuth
  3C: Connection modal UI
  3D: Model selector

M4: THE SACRED BOUNDARY                 — Space Tower ↔ RGB formalized
  4A: Context payload
  4B: Context-aware prompts
  4C: Context-aware rendering              (game state → atmosphere)
  4D: Public API
  4E: The door transition

M5: THE EXPERIENCE SINGS                — Full scenario polish
  5A: Cross-phase NPC evolution
  5B: Object interaction
  5C: Resolution detection
  5D: Atmosphere as storytelling           (resolution → visual mood)
  5E: Error states as weather

M6: DEMO-READY                           — Ship it
  6A: Onboarding
  6B: Performance
  6C: The recording
```

---

## The Rendering Engine Roadmap (Beyond Floor 5)

What you build in Milestone 2 is the seed. Here's how it grows:

**RGB v1 (Floors 1–10):** Atmospheric procedurals. Sky, lighting, particles, fog. The LLM adjusts mood. The player feels it but doesn't think about it. *You learn: shaders, particle systems, parameterization, Three.js rendering pipeline.*

**RGB v2 (Floors 11–20):** Physics-driven visuals. Particle systems gain forces — gravity, attraction, repulsion, turbulence. Fluid-like behaviors. Wave mechanics as shaders. Maybe the tower is entering space now and the view outside is a real-time particle simulation. *You learn: numerical integration, force fields, GPU-driven particle physics.*

**RGB v3 (Floors 21–30):** The rendering is the point. Visualize things that can't be seen — energy flow through the tower's systems, atmospheric composition at altitude, the physics of structural stress. The LLM doesn't just set mood — it explains what you're seeing by orchestrating the visualization. *You learn: scientific data mapping, interactive exploration, LLM-as-guide.*

**RGB v4+ (Floors 31+):** Portable scientific tool. The rendering engine has matured enough to point at real data. Molecular dynamics. Fluid simulations. Astrophysics. The Space Tower was always the training ground.

Each version ships with the game segment. Each version is a time capsule of what the RGB could do at that moment. Segment 1 = 2026 AI + 2026 procedural rendering. The history of the tool is embedded in the game.

---

## Principles

Everything from the v1 gameplan still holds, plus:

- **The atmosphere is the first character.** Before anyone speaks, the room tells you something.
- **Rendering parameters are a language.** The schema you design in 2A is as important as the NPC prompt structure. It's how the LLM talks to the visual world.
- **Lightweight is a feature.** No heavy assets. No model downloads. Math and light. This means it runs everywhere, loads instantly, and can change in real time.
- **Learn the primitives on the restaurant.** Particles, noise, shaders, lighting. These are your building blocks for everything — every future RGB visualization is a combination of these basics.
- **Each segment is a time capsule.** Ship what the RGB can do today. Don't wait for v3 to ship v1.
- **Scientific accuracy is aspirational, not decorative.** When the RGB visualizes physics, it should be *correct* physics, not "looks kinda like physics." This standard starts with how light behaves in the restaurant.

---

## What Success Looks Like

**Floor 5:** A player walks in. The sky through the glass walls is alive — not a static image, a breathing gradient with drifting clouds. Dust catches the light. Steam curls from the kitchen. The room feels warm. They talk to Dev. Three minutes in, the kitchen door opens. Tomás appears. The light shifts — they didn't notice it happen, but the room feels different now. Fifteen minutes later, something resolves. The sky has changed. The restaurant feels like a different place than when they walked in. They return to their tower.

**The demo:** Someone watches a video of this. They understand three things: the game is real, the characters are alive, and the room itself responded to what happened. They've never seen that before.

**The pitch:** "Each segment of Space Tower ships a new version of the RGB. Floors 1-10 use it for atmosphere and character. Floors 11-20 use it for physics visualization. By Floors 21-30, it's a scientific rendering tool. The game is the proving ground. The engine is the product."
