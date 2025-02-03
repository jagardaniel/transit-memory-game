import MapManager from "./MapManager";

type GuessStatus = "default" | "invalid" | "duplicate";

interface GuessState {
  input: string;
  status: GuessStatus;
}

interface MapManagerState {
  instance: MapManager | null;
}

export const guessState = $state<GuessState>({
  input: "",
  status: "default",
});

export const mapManager = $state<MapManagerState>({
  instance: null,
});
