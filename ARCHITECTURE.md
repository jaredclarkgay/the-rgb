# RGB Architecture

## Component Flow

```
┌─────────────────────────────────────────────────────┐
│                    App.jsx                          │
│  • State management (activeNpc, msgs, loading)      │
│  • Auto-greet logic                                 │
│  • API integration (Anthropic Messages API)         │
│  • Conversation history tracking                    │
└──────────────┬──────────────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐   ┌─────────────┐
│  RGBScene   │   │ ChatPanel   │
│  (3D View)  │   │  (Chat UI)  │
└──────┬──────┘   └──────┬──────┘
       │                 │
       ├── HUD          └── Messages
       ├── Scene            ├── Input
       └── NPCs             └── NPC Switcher
```

## Data Flow

```
User Input → RGBScene (detects clicks/hovers)
           ↓
         App.jsx (manages state)
           ↓
     ┌─────┴─────┐
     ▼           ▼
   HUD       ChatPanel
(displays)   (displays + captures input)
     │           │
     └─────┬─────┘
           ↓
    Anthropic API
           ↓
     Response → App.jsx → ChatPanel
```

## File Responsibilities

### `src/App.jsx` (Main Orchestrator)
- **State**: Manages all application state (activeNpc, messages, loading, hover)
- **Logic**: Auto-greet, sendMessage, conversation history
- **API**: Direct fetch to Anthropic Messages API
- **Composition**: Assembles RGBScene, HUD, ChatPanel

### `src/components/RGBScene.jsx` (3D Environment)
- **Rendering**: Vanilla Three.js scene setup
- **Geometry**: Floor, walls, furniture, NPCs
- **Controls**: WASD movement, drag-to-look camera
- **Interactions**: Raycasting for hover/click detection
- **Events**: Calls `onNPCClick(id)` and `onNPCHover(id)`
- **Props**:
  - `containerRef` - DOM element to append canvas
  - `onNPCClick` - Callback when NPC is clicked
  - `onNPCHover` - Callback when hover state changes

### `src/components/HUD.jsx` (Overlay UI)
- **Floor Label**: "FLOOR 5 / Observation Deck"
- **Controls Hint**: "WASD to move · Drag to look · Click to talk"
- **Hover Tooltip**: "Talk to {name}" when hovering NPC
- **Crosshair**: Center crosshair (changes opacity on hover)
- **Props**: `hovered` - currently hovered NPC ID

### `src/components/ChatPanel.jsx` (Conversation UI)
- **Header**: NPC name, subtitle, close button
- **Messages**: Scrollable chat history with player/NPC bubbles
- **NPC Switcher**: Buttons to switch between NPCs
- **Input**: Text field with Enter-to-send and send button
- **Loading**: Animated "..." indicator
- **Auto-scroll**: Scrolls to bottom on new messages
- **Auto-focus**: Focuses input when panel opens
- **Props**:
  - `activeNpc` - Current NPC ID
  - `messages` - Array of message objects
  - `loading` - Boolean loading state
  - `input` - Input field value
  - `onInputChange` - Input change handler
  - `onSend` - Send message handler
  - `onClose` - Close panel handler
  - `onSwitchNpc` - Switch NPC handler
  - `inputRef` - Ref for input element
  - `msgsEndRef` - Ref for auto-scroll target

### `src/systems/npcs.js` (NPC Data)
- **NPCS**: Object containing NPC configurations
  - `name` - Display name
  - `sub` - Subtitle (role)
  - `pos` - 3D position [x, y, z]
  - `body` - Body color (hex)
  - `skin` - Skin color (hex)
  - `sys` - System prompt for AI
- **NPC_IDS**: Array of NPC keys

### `src/systems/ambient.js` (Future)
- Placeholder for ambient events system
- Environmental triggers, background NPCs, etc.

## State Management

### React State (in App.jsx)
```javascript
const [activeNpc, setActiveNpc] = useState(null);      // Current NPC being talked to
const [hovered, setHovered] = useState(null);          // Hovered NPC (for tooltip)
const [msgs, setMsgs] = useState({});                  // Message history per NPC
const [input, setInput] = useState("");                // Current input text
const [loading, setLoading] = useState(false);         // API loading state
```

### Refs (persistent across renders)
```javascript
const histRef = useRef({});        // Conversation history (for API)
const greetRef = useRef({});       // Tracks which NPCs have been greeted
const inputElRef = useRef(null);   // Input element (for focus)
const msgsEndRef = useRef(null);   // Scroll target (for auto-scroll)
```

## API Integration

### Anthropic Messages API
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Model**: `claude-sonnet-4-20250514`
- **Headers**:
  - `Content-Type: application/json`
  - `x-api-key: [from .env]`
  - `anthropic-version: 2023-06-01`
- **Request**:
  ```json
  {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 300,
    "system": "[NPC system prompt]",
    "messages": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ]
  }
  ```

### Auto-Greet Flow
1. User clicks NPC → `setActiveNpc(id)`
2. `useEffect` detects new `activeNpc`
3. Checks if greeted before (`greetRef.current[id]`)
4. If not, sends `"[Someone approaches you.]"`
5. Marks as greeted, displays response

### Send Message Flow
1. User types message and presses Enter/clicks send
2. `sendMessage()` called
3. Adds message to UI immediately
4. Adds to conversation history
5. Sends to API with full history
6. Receives response, adds to UI and history

## Modularity & Reusability

### To Create New Environment

1. **Create new NPC data**:
   ```javascript
   // src/systems/floor6-npcs.js
   export const NPCS = {
     chef: { name: "Chef", pos: [0, 0, 0], ... },
     waiter: { name: "Waiter", pos: [2, 0, 1], ... }
   };
   ```

2. **Update App.jsx**:
   ```javascript
   import { NPCS } from "./systems/floor6-npcs";
   ```

3. **Components work unchanged!**
   - RGBScene renders new NPCs automatically
   - ChatPanel adapts to new NPC data
   - HUD shows new NPC names

### Customization Points

- **Scene geometry**: Modify RGBScene.jsx (lines 72-192)
- **NPC appearance**: Change body/skin colors in npcs.js
- **NPC personalities**: Edit system prompts in npcs.js
- **UI styling**: Modify inline styles in HUD/ChatPanel
- **API model**: Change model in App.jsx

## Performance

- **Three.js**: Vanilla (no React reconciliation overhead)
- **Animation loop**: RAF-based, 60fps target
- **Raycasting**: Only on mouse move (throttled by browser)
- **State updates**: Minimal re-renders (local refs for Three.js)

## Security

- ✅ API key in `.env` (gitignored)
- ✅ No hardcoded secrets
- ✅ Client-side API calls (for prototype; move to server for production)

## Future Enhancements

- [ ] Ambient event system
- [ ] NPC animations (walk cycles, gestures)
- [ ] Voice synthesis for NPC responses
- [ ] Multi-floor navigation
- [ ] Inventory system
- [ ] Quest/objective tracking
