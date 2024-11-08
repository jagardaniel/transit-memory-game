const STORAGE_KEYS = {
  completedGuesses: "completedGuesses",
  newGame: "newGame",
  selectedLines: "selectedLines",
};

export function saveCompletedGuesses(guesses: string[]): void {
  localStorage.setItem(STORAGE_KEYS.completedGuesses, JSON.stringify(Array.from(guesses)));
}

export function loadCompletedGuesses(): string[] {
  const guesses = localStorage.getItem(STORAGE_KEYS.completedGuesses);
  return guesses ? JSON.parse(guesses) : [];
}

export function setNewGameStartedState(): void {
  localStorage.setItem(STORAGE_KEYS.newGame, JSON.stringify(false));
}

export function loadNewGameState(): boolean {
  const newGameState = localStorage.getItem(STORAGE_KEYS.newGame);
  return newGameState ? JSON.parse(newGameState) : true;
}

export function saveSelectedLines(lines: string[]): void {
  localStorage.setItem(STORAGE_KEYS.selectedLines, JSON.stringify(lines));
}

export function loadSelectedLines(): string[] {
  const lines = localStorage.getItem(STORAGE_KEYS.selectedLines);
  return lines ? JSON.parse(lines) : [];
}

export function clearAll(): void {
  localStorage.removeItem(STORAGE_KEYS.completedGuesses);
  localStorage.removeItem(STORAGE_KEYS.newGame);
  localStorage.removeItem(STORAGE_KEYS.selectedLines);
}
