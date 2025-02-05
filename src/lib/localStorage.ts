import { persisted } from "svelte-persisted-store";

export const isGameStarted = persisted("isGameStarted", false);
export const selectedLines = persisted<string[]>("selectedLines", []);
export const completedGuesses = persisted<string[]>("completedGuesses", []);
export const hasSeenIntro = persisted("hasSeenIntro", false);
