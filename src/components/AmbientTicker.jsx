import { useState, useEffect, useRef } from 'react';
import { useScenario } from '../systems/scenarioState';
import { getEventsForPhase, getTransitionEvent } from '../systems/ambientEvents';

const ff = "'Helvetica Neue', Helvetica, sans-serif";

export default function AmbientTicker({ isPaused }) {
  const { phase, hasTriggered, triggerEvent } = useScenario();
  const [currentEvent, setCurrentEvent] = useState(null);
  const [opacity, setOpacity] = useState(0);

  const availableEventsRef = useRef([]);
  const nextEventTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Get available events for current phase (excluding already triggered ones)
  const getAvailableEvents = () => {
    if (phase === 0) return [];

    const phaseEvents = getEventsForPhase(phase);
    return phaseEvents.filter(event => !hasTriggered(event.id));
  };

  // Pick next event based on priority
  const pickNextEvent = () => {
    const available = availableEventsRef.current;
    if (available.length === 0) return null;

    // Separate by priority
    const critical = available.filter(e => e.priority === 'critical');
    const high = available.filter(e => e.priority === 'high');
    const normal = available.filter(e => e.priority === 'normal');
    const low = available.filter(e => e.priority === 'low');
    const atmosphere = available.filter(e => e.priority === 'atmosphere');

    // Pick from highest priority pool available
    let pool = [];
    if (critical.length > 0) pool = critical;
    else if (high.length > 0) pool = high;
    else if (normal.length > 0) pool = normal;
    else if (low.length > 0) pool = low;
    else if (atmosphere.length > 0) pool = atmosphere;

    if (pool.length === 0) return null;

    // Random selection from pool
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Show an event
  const showEvent = (event) => {
    if (!event) return;

    setCurrentEvent(event);
    triggerEvent(event.id);

    // Fade in
    setOpacity(0);
    setTimeout(() => setOpacity(1), 50);

    // Hold for 5-6 seconds, then fade out
    const holdTime = 5000 + Math.random() * 1000;
    fadeTimerRef.current = setTimeout(() => {
      setOpacity(0);
      // Clear after fade out
      setTimeout(() => {
        setCurrentEvent(null);
        scheduleNextEvent();
      }, 500);
    }, holdTime);
  };

  // Schedule next event
  const scheduleNextEvent = () => {
    if (isPaused || phase === 0) return;

    // Update available events
    availableEventsRef.current = getAvailableEvents();

    const nextEvent = pickNextEvent();
    if (!nextEvent) return;

    // Randomize interval: 8-15 seconds (faster for high-priority phases)
    const baseInterval = phase >= 3 ? 8000 : 10000; // Faster in phases 3+
    const variance = 7000;
    const interval = baseInterval + Math.random() * variance;

    nextEventTimerRef.current = setTimeout(() => {
      showEvent(nextEvent);
    }, interval);
  };

  // Handle phase transitions
  useEffect(() => {
    if (phase === 0) return;

    // Check for transition event
    const transitionEvent = getTransitionEvent(phase);
    if (transitionEvent && !hasTriggered(transitionEvent.id) && !isTransitioningRef.current) {
      isTransitioningRef.current = true;

      // Clear any current event and timers
      clearTimeout(nextEventTimerRef.current);
      clearTimeout(fadeTimerRef.current);
      setOpacity(0);

      // Show transition event immediately
      setTimeout(() => {
        showEvent(transitionEvent);
        isTransitioningRef.current = false;
      }, 300);
    } else {
      // Regular phase change - update available events
      availableEventsRef.current = getAvailableEvents();
    }
  }, [phase]);

  // Start/stop ticker based on pause state
  useEffect(() => {
    if (isPaused || phase === 0) {
      // Pause - clear timers
      clearTimeout(nextEventTimerRef.current);
      clearTimeout(fadeTimerRef.current);
      return;
    }

    // Resume - schedule next event if none is showing
    if (!currentEvent && !nextEventTimerRef.current) {
      availableEventsRef.current = getAvailableEvents();
      scheduleNextEvent();
    }

    return () => {
      clearTimeout(nextEventTimerRef.current);
      clearTimeout(fadeTimerRef.current);
    };
  }, [isPaused, phase, currentEvent]);

  // Don't render if no event or phase 0
  if (!currentEvent || phase === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 56,
      left: 20,
      pointerEvents: 'none',
      fontFamily: ff,
      zIndex: 10,
      opacity: opacity,
      transition: 'opacity 0.5s ease-in-out',
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: 8,
        padding: '8px 16px',
        color: '#fff',
        fontSize: 12,
        lineHeight: 1.4,
        maxWidth: 420,
      }}>
        {currentEvent.text}
      </div>
    </div>
  );
}
