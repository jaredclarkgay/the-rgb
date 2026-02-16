import { useEffect } from "react";
import { NPCS, NPC_IDS } from "../systems/npcs";

const ff = "'Helvetica Neue', Helvetica, sans-serif";

export default function ChatPanel({
  activeNpc,
  messages,
  loading,
  input,
  onInputChange,
  onSend,
  onClose,
  onSwitchNpc,
  inputRef,
  msgsEndRef
}) {
  const npc = NPCS[activeNpc];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, msgsEndRef]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (activeNpc) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [activeNpc, inputRef]);

  return (
    <div style={{
      width: 360,
      height: "100%",
      background: "#0a0a10",
      borderLeft: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexDirection: "column",
      fontFamily: ff,
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{npc.name}</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>{npc.sub}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: 18,
            cursor: "pointer",
            padding: "2px 6px"
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "player" ? "flex-end" : "flex-start",
              maxWidth: "88%"
            }}
          >
            {msg.role === "npc" && (
              <div style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 10,
                marginBottom: 3,
                letterSpacing: 1,
                textTransform: "uppercase"
              }}>
                {npc.name}
              </div>
            )}
            <div style={{
              background: msg.role === "player" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
              borderRadius: msg.role === "player" ? "10px 10px 3px 10px" : "10px 10px 10px 3px",
              padding: "9px 13px",
              fontSize: 13,
              lineHeight: 1.5,
              color: msg.role === "player" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start" }}>
            <div style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 10,
              marginBottom: 3,
              letterSpacing: 1,
              textTransform: "uppercase"
            }}>
              {npc.name}
            </div>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px 10px 10px 3px",
              padding: "9px 13px",
              color: "rgba(255,255,255,0.25)",
              fontSize: 13
            }}>
              <span style={{ animation: "dp 1.5s infinite" }}>. . .</span>
            </div>
          </div>
        )}
        <div ref={msgsEndRef} />
      </div>

      {/* NPC switcher */}
      <div style={{
        padding: "6px 14px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        gap: 4
      }}>
        {NPC_IDS.map(id => (
          <button
            key={id}
            onClick={() => onSwitchNpc(id)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: 5,
              border: "none",
              fontSize: 11,
              cursor: "pointer",
              background: id === activeNpc ? "rgba(255,255,255,0.1)" : "transparent",
              color: id === activeNpc ? "#fff" : "rgba(255,255,255,0.35)",
            }}
          >
            {NPCS[id].name}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "8px 14px 14px" }}>
        <div style={{
          display: "flex",
          gap: 6,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 8,
          padding: "3px 3px 3px 12px",
          alignItems: "center"
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
              e.stopPropagation();
            }}
            placeholder={`Talk to ${npc.name}...`}
            disabled={loading}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontFamily: ff
            }}
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            style={{
              background: input.trim() ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none",
              borderRadius: 6,
              padding: "7px 12px",
              color: input.trim() ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)",
              fontSize: 12,
              cursor: input.trim() ? "pointer" : "default",
            }}
          >
            ↵
          </button>
        </div>
      </div>
    </div>
  );
}
