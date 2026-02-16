import { useState, useEffect, useRef } from "react";
import RGBScene from "./components/RGBScene";
import HUD from "./components/HUD";
import ChatPanel from "./components/ChatPanel";
import AmbientTicker from "./components/AmbientTicker";
import { NPCS, getNpcPrompt } from "./systems/npcs";
import { useScenario } from "./systems/scenarioState.jsx";

export default function App() {
  const containerRef = useRef(null);

  // Scenario state
  const { phase, tomasSpawned, beginScenario } = useScenario();

  // State
  const [activeNpc, setActiveNpc] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [msgs, setMsgs] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs for conversation history and greet tracking
  const histRef = useRef({});
  const greetRef = useRef({});
  const inputElRef = useRef(null);
  const msgsEndRef = useRef(null);

  // Auto-greet when NPC is clicked for the first time
  useEffect(() => {
    if (activeNpc && !greetRef.current[activeNpc]) {
      greetRef.current[activeNpc] = true;
      (async () => {
        setLoading(true);
        const init = [{ role: "user", content: "[Someone approaches you.]" }];
        histRef.current[activeNpc] = [...init];
        try {
          const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
          if (!apiKey) {
            throw new Error("API key not found. Set VITE_ANTHROPIC_API_KEY in .env");
          }

          const res = await fetch("/api/anthropic/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 300,
              system: getNpcPrompt(activeNpc, phase),
              messages: init
            }),
          });

          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }

          const data = await res.json();
          const text = data.content?.map(b => b.type === "text" ? b.text : "").filter(Boolean).join("\n") || "...";
          histRef.current[activeNpc].push({ role: "assistant", content: text });
          setMsgs(p => ({ ...p, [activeNpc]: [{ role: "npc", text }] }));
        } catch (e) {
          console.error("Greet error:", e);
          setMsgs(p => ({ ...p, [activeNpc]: [{ role: "npc", text: "(They look at you expectantly.)" }] }));
        }
        setLoading(false);
      })();
    }
  }, [activeNpc]);

  // Send message to NPC
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !activeNpc) return;

    setInput("");
    setMsgs(p => ({ ...p, [activeNpc]: [...(p[activeNpc] || []), { role: "player", text }] }));

    if (!histRef.current[activeNpc]) histRef.current[activeNpc] = [];
    histRef.current[activeNpc].push({ role: "user", content: text });

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("API key not found. Set VITE_ANTHROPIC_API_KEY in .env");
      }

      const res = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: getNpcPrompt(activeNpc, phase),
          messages: histRef.current[activeNpc]
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.content?.map(b => b.type === "text" ? b.text : "").filter(Boolean).join("\n") || "...";
      histRef.current[activeNpc].push({ role: "assistant", content: reply });
      setMsgs(p => ({ ...p, [activeNpc]: [...(p[activeNpc] || []), { role: "npc", text: reply }] }));
    } catch (e) {
      console.error("Send error:", e);
      setMsgs(p => ({ ...p, [activeNpc]: [...(p[activeNpc] || []), { role: "npc", text: "(too noisy to hear)" }] }));
    }
    setLoading(false);
  };

  const curMsgs = activeNpc ? (msgs[activeNpc] || []) : [];

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      display: "flex",
      overflow: "hidden",
      background: "#111"
    }}>
      {/* 3D Viewport */}
      <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <RGBScene
          containerRef={containerRef}
          onNPCClick={setActiveNpc}
          onNPCHover={setHovered}
          onFirstInteraction={beginScenario}
          scenarioPhase={phase}
          tomasSpawned={tomasSpawned}
        />
        <HUD hovered={activeNpc ? null : hovered} />
        <AmbientTicker isPaused={!!activeNpc} />
      </div>

      {/* Chat Panel */}
      {activeNpc && (
        <ChatPanel
          activeNpc={activeNpc}
          messages={curMsgs}
          loading={loading}
          input={input}
          onInputChange={setInput}
          onSend={sendMessage}
          onClose={() => setActiveNpc(null)}
          onSwitchNpc={setActiveNpc}
          inputRef={inputElRef}
          msgsEndRef={msgsEndRef}
        />
      )}

      {/* Loading animation */}
      <style>{`@keyframes dp { 0%,100%{opacity:0.3} 50%{opacity:0.8} }`}</style>
    </div>
  );
}
