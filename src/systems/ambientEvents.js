// Ambient event library - handwritten atmospheric one-liners organized by phase
export const AMBIENT_EVENTS = {
  phase1: [
    { id: "p1_01", text: "Dev is straightening the silverware on table four. Again.", priority: "normal" },
    { id: "p1_02", text: "Margaux holds her wine glass up to the light. It's still empty.", priority: "normal" },
    { id: "p1_03", text: "Priya drops a menu. Picks it up. Drops it again.", priority: "normal" },
    { id: "p1_04", text: "Dev whispers something to a passing server. The server's eyes go wide.", priority: "normal" },
    { id: "p1_05", text: "A couple near the window is trying to take a selfie with the view.", priority: "low" },
    { id: "p1_06", text: "Margaux writes something on her phone. Her expression is unreadable.", priority: "normal" },
    { id: "p1_07", text: "The specials board near the kitchen has a piece of paper taped over one item.", priority: "normal" },
    { id: "p1_08", text: "You can hear faint shouting from the kitchen. It might just be how chefs talk.", priority: "normal" },
    { id: "p1_09", text: "Dev checks his phone. Puts it away. Checks it again.", priority: "low" },
    { id: "p1_10", text: "The elevator dings behind you. Nobody gets off.", priority: "low" },
    { id: "p1_11", text: "Sunlight catches the glass walls. The city below looks like a model.", priority: "atmosphere" },
    { id: "p1_12", text: "A server rushes past carrying an empty tray. They seem confused about where to go.", priority: "normal" },
  ],

  phase2_transition: [
    { id: "p2_trans", text: "The kitchen door slams open. A man in a chef's coat stands in the doorway, looking furious.", priority: "critical" },
  ],

  phase2: [
    { id: "p2_01", text: "Tomás is pointing at the specials board. His voice carries across the room.", priority: "high" },
    { id: "p2_02", text: "Dev has positioned himself between Tomás and the dining room. It's not working.", priority: "normal" },
    { id: "p2_03", text: "\"Who changed my SPECIALS BOARD?\" You can hear Tomás from across the room.", priority: "high" },
    { id: "p2_04", text: "Priya has frozen near table six, holding two plates. She's staring at the kitchen door.", priority: "normal" },
    { id: "p2_05", text: "Margaux looks up from her menu. She's watching the argument with visible interest.", priority: "normal" },
    { id: "p2_06", text: "Dev's stage whisper is not, technically, a whisper.", priority: "normal" },
    { id: "p2_07", text: "Two diners near the bar are pretending not to watch. They're watching.", priority: "low" },
    { id: "p2_08", text: "Tomás rips the taped paper off the specials board.", priority: "high" },
    { id: "p2_09", text: "The kitchen door swings shut. Something metal falls over inside.", priority: "normal" },
    { id: "p2_10", text: "Margaux is taking notes. Margaux is definitely taking notes.", priority: "normal" },
  ],

  phase3_transition: [
    { id: "p3_trans", text: "Priya is carrying a dish toward Margaux's table. She looks uncertain. That's the wrong plate.", priority: "critical" },
  ],

  phase3: [
    { id: "p3_01", text: "Margaux stares at the plate in front of her. It's clearly not what she ordered.", priority: "high" },
    { id: "p3_02", text: "Tomás steps into the dining room. He hasn't seen her yet.", priority: "high" },
    { id: "p3_03", text: "Dev is trying to redirect Tomás back toward the kitchen. Tomás isn't moving.", priority: "normal" },
    { id: "p3_04", text: "Tomás looks at the center table. He stops. Completely stops.", priority: "critical" },
    { id: "p3_05", text: "A diner at table two has pulled out their phone. They're recording.", priority: "normal" },
    { id: "p3_06", text: "Priya mouths 'I'm sorry' at Dev. Dev doesn't see her.", priority: "normal" },
    { id: "p3_07", text: "Margaux hasn't touched the wrong dish. She's looking at the chef who just walked in.", priority: "high" },
    { id: "p3_08", text: "The kitchen is making sounds that suggest no one is in charge in there.", priority: "normal" },
    { id: "p3_09", text: "\"Margaux?\" Tomás says it so quietly you almost miss it.", priority: "critical" },
    { id: "p3_10", text: "Dev looks between Tomás and Margaux and realizes he has no idea what's happening.", priority: "normal" },
  ],

  phase4_transition: [
    { id: "p4_trans", text: "Tomás walks toward Margaux's table. The restaurant goes quiet.", priority: "critical" },
  ],

  phase4: [
    { id: "p4_01", text: "Tomás is standing at Margaux's table. Neither of them is speaking.", priority: "high" },
    { id: "p4_02", text: "Margaux sets down her pen. That might be the first time she's done that since she arrived.", priority: "normal" },
    { id: "p4_03", text: "Dev is watching from behind the host stand. He's gripping the edge of it.", priority: "normal" },
    { id: "p4_04", text: "Priya is hiding near the bar. She peeks out occasionally.", priority: "low" },
    { id: "p4_05", text: "\"It's been twenty-five years.\" You're not sure which of them said it.", priority: "critical" },
    { id: "p4_06", text: "The diner with the phone has stopped recording. Even they feel the weight of this.", priority: "normal" },
    { id: "p4_07", text: "Something in the kitchen is burning. Nobody cares.", priority: "normal" },
    { id: "p4_08", text: "Tomás pulls out the chair across from Margaux. He doesn't sit yet.", priority: "high" },
  ],

  phase5: [
    { id: "p5_01", text: "The restaurant has settled into something quieter. Whatever happened, happened.", priority: "normal" },
    { id: "p5_02", text: "Dev is leaning against the host stand. He looks exhausted but relieved.", priority: "normal" },
    { id: "p5_03", text: "Priya is finally delivering orders. She's smiling, tentatively.", priority: "low" },
    { id: "p5_04", text: "The view from the windows catches you. Earth, still close enough to touch.", priority: "atmosphere" },
    { id: "p5_05", text: "Someone in the kitchen turns the radio on. You can hear faint music.", priority: "atmosphere" },
    { id: "p5_06", text: "The light has shifted. It's later than you thought.", priority: "atmosphere" },
    { id: "p5_07", text: "A new couple steps off the elevator. They look around, delighted. They have no idea what they missed.", priority: "normal" },
    { id: "p5_08", text: "The city below is still there. The roads, the buildings, the trees. Life going on.", priority: "atmosphere" },
  ],
};

// Get events for a specific phase
export function getEventsForPhase(phase) {
  const key = `phase${phase}`;
  return AMBIENT_EVENTS[key] || [];
}

// Get transition event for a phase
export function getTransitionEvent(phase) {
  const key = `phase${phase}_transition`;
  return AMBIENT_EVENTS[key]?.[0] || null;
}
