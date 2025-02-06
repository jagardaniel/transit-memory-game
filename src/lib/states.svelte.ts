import { Game } from "./Game";
import { MapManager } from "./MapManager";

interface MapManagerState {
  instance: MapManager | null;
}

interface GameState {
  instance: Game;
}

type GuessStatus = "default" | "invalid" | "duplicate";

interface GuessState {
  input: string;
  status: GuessStatus;
}

// Shared runes
export const mapManager = $state<MapManagerState>({
  instance: null,
});

export const game = $state<GameState>({
  instance: new Game(),
});

export const guessState = $state<GuessState>({
  input: "",
  status: "default",
});

// One problem I encountered is that the game variable above does not trigger reactivity when I updated something
// inside the game class. So if I run "game.instance.setCompletedGuesses([...])" to update completed guesses for
// example it does not trigger change for component that uses game. I didn't find any good solution so right now
// we can just increase this value to manaully trigger a change.
export const triggerGameUpdate = $state({
  value: 0,
});
