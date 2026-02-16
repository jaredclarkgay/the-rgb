import { NPCS } from "../systems/npcs";

const ff = "'Helvetica Neue', Helvetica, sans-serif";

export default function HUD({ hovered }) {
  return (
    <>
      {/* Floor label */}
      <div style={{ position: "absolute", top: 16, left: 20, pointerEvents: "none", fontFamily: ff, zIndex: 10 }}>
        <div style={{ color: "#fff", fontSize: 11, letterSpacing: 3, opacity: 0.5 }}>FLOOR 5</div>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 300, letterSpacing: 1, opacity: 0.7 }}>Observation Deck</div>
      </div>

      {/* Controls hint */}
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", fontFamily: ff, zIndex: 10 }}>
        <div style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 6, padding: "8px 16px", color: "#fff", fontSize: 11, opacity: 0.7 }}>
          WASD to move · Drag to look · Click a person to talk
        </div>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, 30px)", pointerEvents: "none", fontFamily: ff, zIndex: 10 }}>
          <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 12 }}>
            Talk to {NPCS[hovered].name}
          </div>
        </div>
      )}

      {/* Crosshair */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 10 }}>
        <div style={{ width: 1, height: 14, background: hovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{ width: 14, height: 1, background: hovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
      </div>
    </>
  );
}
