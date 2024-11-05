import { clearCompletedGuesses, loadCompletedGuesses, saveCompletedGuesses } from "./helpers/localStorage";
import { MapManager } from "./MapManager";
import { Game } from "./models/Game";

export class GameApp {
  private game: Game;
  private map: MapManager;
  private stationInput: HTMLInputElement | null;

  constructor(game: Game, map: MapManager) {
    this.game = game;
    this.map = map;
    this.stationInput = document.querySelector<HTMLInputElement>("#station-input");

    this.initializeGame();
    this.setupEventListeners();
  }

  private async initializeGame(): Promise<void> {
    // Load completed guesses from local storage
    const savedGuesses = loadCompletedGuesses();

    // Set them as marked
    this.map.markStationsAsGuessed(savedGuesses);

    this.game.setInitialGuesses(savedGuesses);
    this.updateUI();

    if (this.stationInput) {
      this.stationInput.focus();
    }
  }

  private setupEventListeners(): void {
    if (this.stationInput) {
      this.stationInput.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.handleGuess();
        }
      });
    }

    const resetButton = document.querySelector<HTMLButtonElement>("#reset-game");
    if (resetButton) {
      resetButton.addEventListener("click", () => this.handleReset());
    }
  }

  private handleGuess(): void {
    if (this.stationInput) {
      const stationName = this.stationInput.value.trim();

      if (this.game.makeGuess(stationName)) {
        const station = this.game.getStation(stationName);
        if (!station) return;

        this.stationInput.value = "";

        // Save to local storage
        saveCompletedGuesses(this.game.getCompletedGuesses());

        this.updateUI();
        this.map.markStationsAsGuessed(station);
        this.map.flyToStation(station);
      } else {
        let styling = ["shake"];

        if (this.game.getCompletedGuesses().some((x) => x.toLocaleLowerCase() === stationName.toLocaleLowerCase())) {
          styling.push("duplicate-guess");
        } else {
          styling.push("wrong-guess");
        }

        this.stationInput.classList.add(...styling);

        setTimeout(() => {
          if (this.stationInput) {
            this.stationInput.classList.remove(...styling);
          }
        }, 500);
      }
    }
  }

  private handleReset(): void {
    const reset = confirm("Är du säker på att du vill börja om? Detta återställer alla dina nuvarande gissningar.");
    if (reset) this.resetGame();
  }

  private resetGame(): void {
    // Clear local storage
    clearCompletedGuesses();

    this.game.reset();
    this.updateUI();

    if (this.stationInput) {
      this.stationInput.value = "";
    }

    this.map.resetStations();
    this.map.resetZoom();
  }

  private updateUI(): void {
    console.log("Updating UI...");
  }
}
