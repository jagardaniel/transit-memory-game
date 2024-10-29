const STORAGE_KEY = "completedGuesses";

export function saveCompletedGuesses(guesses: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(guesses)));
}

export function loadCompletedGuesses(): string[] {
  const guesses = localStorage.getItem(STORAGE_KEY);
  return guesses ? JSON.parse(guesses) : [];
}

export function clearCompletedGuesses(): void {
  localStorage.removeItem(STORAGE_KEY);
}
