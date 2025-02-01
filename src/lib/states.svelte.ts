type GuessStatus = "default" | "invalid" | "duplicate";

interface GuessState {
  input: string;
  status: GuessStatus;
}

export const guessState = $state<GuessState>({
  input: "",
  status: "default",
});
