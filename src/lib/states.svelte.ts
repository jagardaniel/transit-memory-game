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
