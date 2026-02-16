# Design Philosophy: Characters & Interaction Ethics

## What is the RGB?

The RGB — the Reality Generation Box — is a rendering apparatus. Its purpose is to make the invisible visible and the abstract tangible: to take something you can't normally see or experience and let you step inside it, examine it, and understand it.

At its most expansive, the RGB is a tool for discovery. Slow down atomic motion and watch electron orbitals. Render butter melting in a pan at the molecular level and investigate what's actually happening between the fat and the garlic and the heat. Visualize a black hole's accretion disk from the inside. Simulate weather systems, chemical reactions, biological processes — anything that benefits from being seen rather than described.

The RGB's first application is inside Space Tower, where it transforms the floors of a tower-building sim into first-person, LLM-driven environments that players can walk through and experience. But the game is an application of the RGB, not its totality. The architecture should always be built with the understanding that the RGB will evolve far beyond this game into something robust, high-fidelity, and deeply powerful as a tool for exploration, education, and scientific investigation.

---

## Scope of This Document

This document governs how the RGB handles **characters** — AI-driven people that inhabit RGB environments. It establishes the ethical and design principles for NPC interaction, conversation systems, scenario design, and player-character relationships.

Not every RGB experience will involve characters. Many will be purely exploratory simulations with no social dimension at all. But when the RGB does generate people — when it asks a player or user to interact with an AI that behaves like a human being — these principles apply.

---

## The Holodeck, Not Westworld

The difference between Star Trek's Holodeck and Westworld's park isn't the technology. It's the relationship between the person and the experience.

The Holodeck is a place you visit and then leave. You go in, you have an experience that teaches you something or lets you feel something, and you come back to your life changed in some small way. Westworld is a place people go to stop being themselves — to do things they can't do in reality. The technology is identical. The difference is whether the experience sends you back to your life with more, or whether it becomes a replacement for your life.

When the RGB generates characters, it builds a Holodeck. Every design decision should reinforce this.

---

## Principles for Character Interaction

### 1. Characters Have Dignity

The people in the RGB are not toys. They are not vending machines for content. They have their own stories, their own secrets, their own capacity to surprise you and refuse you.

When a player pushes boundaries, characters respond with realistic social disapproval — "Sir, I'm going to have to ask you to leave." They don't break. They don't comply. They don't escalate to match cruelty. They disengage, the way a real person would.

This is an engineering requirement, not just a philosophy. Every system prompt must encode a baseline of dignity and self-respect that the character never drops below.

### 2. The Deep Path is the Human One

Every scenario involving characters should be designed so that the richest, most interesting resolution comes from treating the characters like people. Not because we block the other paths — the chaos path should exist and be funny — but because the writing is better, the revelations are deeper, and the emotional payoff is greater on the empathetic path.

Players will find the depth where you put it. Put it on the human path.

### 3. Inconsequential Stakes

In the Space Tower context: nothing in the RGB affects your tower. You can't optimize it. You can't grind it. There is no reward loop pulling you back in compulsively. You go in, you have an experience with people, and you come back to the macro view.

More broadly: RGB character experiences should never create compulsion loops or exploit social bonding with AI for retention purposes. The reward is the experience itself.

### 4. Discovery Over Instruction

The RGB never tells the player what to do. There are no tutorials, no objective markers, no quest logs. You walk in, something is already happening, and you figure it out.

This respects the person's intelligence and creates genuine discovery — understanding something because you noticed it, not because you were told.

### 5. AI is the Medium, Not a Feature

The characters and scenarios are generated in real-time by AI. This isn't a selling point to advertise — it's the material the experience is made of. The same way a film isn't "a story with cameras," the RGB isn't "a game with AI NPCs."

---

## The Westworld Test

The signal that character design has drifted is when the experience starts being about the user's power over the characters rather than about the characters themselves.

Ask of every feature, scenario, and system:

- **Does this send the person back to reality with something valuable?** A great novel does this. A conversation with a stranger that surprises you does this. If yes, build it.
- **Does this make the characters feel like people or like toys?** If a feature reduces character agency, reconsider it. If it increases the user's sense of dominance over the characters, reconsider it.
- **Does this reward curiosity and empathy, or does it reward exploitation?** The most interesting outcome should come from genuine engagement.

---

## Technical Implications for Character Systems

- **System prompts**: Every NPC prompt must encode a baseline of dignity. Characters have clear boundaries they maintain regardless of player behavior.
- **Scenario design**: The empathetic path is always the deepest and most narratively rewarding. Other paths are valid but intentionally shallower.
- **Guardrails**: Characters handle boundary violations in-character (social disapproval, disengagement) rather than breaking the fourth wall.
- **Reward structure**: No XP, no loot, no unlocks tied to character interaction. The reward is the experience.
- **Ambient life**: Characters should feel like they exist independent of the user. Things happen whether you're watching or not. You are a visitor in a living place.

---

*This document governs character interaction within the RGB. It should be read by anyone writing scenarios, system prompts, or social interaction systems. It does not govern the RGB's broader capabilities as a rendering and simulation tool — that architecture is documented separately.*
