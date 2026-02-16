import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Phase timing thresholds (in seconds)
const PHASE_THRESHOLDS = {
  1: 0,      // Phase 1: 0:00-3:00
  2: 180,    // Phase 2: 3:00-6:00
  3: 360,    // Phase 3: 6:00-10:00
  4: 600,    // Phase 4: 10:00-15:00
  5: 900,    // Phase 5: 15:00+
};

const ScenarioContext = createContext(null);

export function ScenarioProvider({ children }) {
  const [phase, setPhase] = useState(0); // 0 = pre-entry
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [triggeredEvents, setTriggeredEvents] = useState([]);
  const [tomasSpawned, setTomasSpawned] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const phaseCallbacksRef = useRef(new Set());

  // Start the scenario clock on first interaction
  const beginScenario = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setStartTime(Date.now());
      setPhase(1);
      console.log('[Scenario] Started - Phase 1 begins');
    }
  }, [hasInteracted]);

  // Register phase change callbacks
  const onPhaseChange = useCallback((callback) => {
    phaseCallbacksRef.current.add(callback);
    return () => phaseCallbacksRef.current.delete(callback);
  }, []);

  // Trigger a specific event (mark as seen)
  const triggerEvent = useCallback((eventId) => {
    setTriggeredEvents(prev => {
      if (!prev.includes(eventId)) {
        return [...prev, eventId];
      }
      return prev;
    });
  }, []);

  // Check if event has been triggered
  const hasTriggered = useCallback((eventId) => {
    return triggeredEvents.includes(eventId);
  }, [triggeredEvents]);

  // Timer: tick elapsed time and check phase transitions
  useEffect(() => {
    if (!startTime || phase === 0) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      // Check for phase transitions
      let newPhase = phase;
      if (elapsed >= PHASE_THRESHOLDS[5] && phase < 5) {
        newPhase = 5;
      } else if (elapsed >= PHASE_THRESHOLDS[4] && phase < 4) {
        newPhase = 4;
      } else if (elapsed >= PHASE_THRESHOLDS[3] && phase < 3) {
        newPhase = 3;
      } else if (elapsed >= PHASE_THRESHOLDS[2] && phase < 2) {
        newPhase = 2;
      }

      if (newPhase !== phase) {
        console.log(`[Scenario] Phase transition: ${phase} → ${newPhase}`);
        setPhase(newPhase);

        // Notify callbacks
        phaseCallbacksRef.current.forEach(callback => {
          callback(newPhase, phase);
        });

        // Spawn Tomás at Phase 2
        if (newPhase === 2 && !tomasSpawned) {
          setTomasSpawned(true);
          console.log('[Scenario] Tomás spawned');
        }

        // Mark as resolved at Phase 5
        if (newPhase === 5) {
          setResolved(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, phase, tomasSpawned]);

  // Manual phase advance (for testing or player-triggered events)
  const advancePhase = useCallback(() => {
    if (phase < 5) {
      const newPhase = phase + 1;
      console.log(`[Scenario] Manual phase advance: ${phase} → ${newPhase}`);
      setPhase(newPhase);

      phaseCallbacksRef.current.forEach(callback => {
        callback(newPhase, phase);
      });

      if (newPhase === 2 && !tomasSpawned) {
        setTomasSpawned(true);
      }
      if (newPhase === 5) {
        setResolved(true);
      }
    }
  }, [phase, tomasSpawned]);

  const value = {
    phase,
    elapsedTime,
    startTime,
    triggeredEvents,
    tomasSpawned,
    resolved,
    hasInteracted,
    beginScenario,
    onPhaseChange,
    triggerEvent,
    hasTriggered,
    advancePhase,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within ScenarioProvider');
  }
  return context;
}
