// Global state for NexPractice transitions
export let globalNexPracticeLoadingState = false;
export let globalExitAnimationState = false;
export let globalExitPosition = { x: 0, y: 0 };
let listeners: Array<() => void> = [];

// Function to notify listeners of state changes
function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Add/remove listeners
export function addStateChangeListener(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

// Functions to update the global state
export function startNexPracticeLoading() {
  globalNexPracticeLoadingState = true;
  notifyListeners();
}

export function startNexPracticeExitAnimation(position: { x: number, y: number }) {
  globalExitAnimationState = true;
  globalExitPosition = position;
  notifyListeners();
}

export function stopNexPracticeLoading() {
  globalNexPracticeLoadingState = false;
  globalExitAnimationState = false;
  notifyListeners();
}

// Expose the function to the global window object
if (typeof window !== 'undefined') {
  (window as any).stopNexPracticeLoading = stopNexPracticeLoading;
}
