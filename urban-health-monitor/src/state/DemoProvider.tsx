// ──────────────────────────────────────────────
// Urban Health Monitoring System – Demo Context Provider
// ──────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
  type Dispatch,
} from 'react';
import { AppState, AppAction } from '../types';
import { demoReducer, createInitialState } from './demoReducer';

// ── Context ─────────────────────────────────────

const DemoStateContext = createContext<AppState | undefined>(undefined);
const DemoDispatchContext = createContext<Dispatch<AppAction> | undefined>(undefined);

// ── Provider component ──────────────────────────

interface DemoProviderProps {
  children: ReactNode;
}

/**
 * Wraps the application tree and provides the demo simulation state + dispatch.
 *
 * When `isPlaying` is true, a TICK action is dispatched every 5 seconds.
 * The interval is cleaned up when the component unmounts or when playback pauses.
 */
export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear any existing interval first to prevent duplicates
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state.isPlaying) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 5_000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isPlaying]);

  return (
    <DemoStateContext.Provider value={state}>
      <DemoDispatchContext.Provider value={dispatch}>
        {children}
      </DemoDispatchContext.Provider>
    </DemoStateContext.Provider>
  );
};

// ── Hooks ───────────────────────────────────────

/**
 * Access the current demo simulation state.
 * Must be called inside a `<DemoProvider>`.
 */
export function useDemoState(): AppState {
  const ctx = useContext(DemoStateContext);
  if (ctx === undefined) {
    throw new Error('useDemoState must be used within a <DemoProvider>');
  }
  return ctx;
}

/**
 * Access the dispatch function for demo actions.
 * Must be called inside a `<DemoProvider>`.
 */
export function useDemoDispatch(): Dispatch<AppAction> {
  const ctx = useContext(DemoDispatchContext);
  if (ctx === undefined) {
    throw new Error('useDemoDispatch must be used within a <DemoProvider>');
  }
  return ctx;
}
