import {
  clearAll,
  loadCompletedGuesses,
  loadNewGameState,
  loadSelectedLines,
  saveCompletedGuesses,
  saveSelectedLines,
  setNewGameStartedState,
} from "./helpers/localStorage";
import { MapManager } from "./MapManager";
import { Game, GuessResult } from "./models/Game";
import { lineLoaders } from "./LineSetup";
import { FeatureCollection } from "geojson";

export class GameApp {
  private game: Game;
  private map: MapManager;

  private stationInput: HTMLInputElement | null;
  private searchContainer: HTMLDivElement | null;
  private lineCheckboxes: HTMLInputElement[] | null;
  private startButton: HTMLButtonElement | null;
  private startModal: HTMLDivElement | null;

  constructor() {
    this.game = new Game();
    this.map = new MapManager(this.game);

    this.stationInput = document.querySelector<HTMLInputElement>("#station-input");
    this.searchContainer = document.querySelector<HTMLDivElement>("#search");
    this.lineCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    this.startButton = document.querySelector<HTMLButtonElement>("#start-button");
    this.startModal = document.querySelector<HTMLDivElement>("#modal");

    this.setupEventListeners();
    this.checkGameStatus();
  }

  private checkGameStatus(): void {
    // Check if a game has already started
    const newGame = loadNewGameState();

    if (newGame) {
      this.createNewGame();
    } else {
      this.loadCurrentGame();
    }
  }

  private createNewGame(): void {
    if (this.startModal) {
      this.startModal.style.display = "block";
    }

    // The rest happens in startNewGame() when the start button is pressed
  }

  private async loadCurrentGame(): Promise<void> {
    // Load selected lines from local storage
    const selectedLines = loadSelectedLines();

    // Load completed guesses from local storage
    const savedGuesses = loadCompletedGuesses();

    await this.loadLines(selectedLines);
    await this.loadMap();

    this.game.setInitialGuesses(savedGuesses);
    this.map.markStationsAsGuessed(savedGuesses);

    this.setInitialView();

    if (this.stationInput && this.searchContainer) {
      this.searchContainer.style.display = "block";
      this.stationInput.focus();
    }
  }

  private async startNewGame(): Promise<void> {
    if (this.startModal) {
      this.startModal.style.display = "none";
    }

    const userSelectedLines = this.getUserSelectedLines();
    // This should not happen, but check to be safe
    if (userSelectedLines.length < 1) {
      console.error("Unable to start a game without any specified lines.");
      return;
    }

    // Mark game as started in local storage
    setNewGameStartedState();

    // Save selected lines to local storage
    saveSelectedLines(userSelectedLines);

    await this.loadLines(userSelectedLines);
    await this.loadMap();

    this.setInitialView();

    if (this.stationInput && this.searchContainer) {
      this.searchContainer.style.display = "block";
      this.stationInput.value = "";
      this.stationInput.focus();
    }
  }

  private resetGame(): void {
    // Clear local storage
    clearAll();

    // Hide text input form
    if (this.searchContainer) {
      this.searchContainer.style.display = "none";
    }

    this.game.reset();
    this.updateUI();

    this.map.resetMap();
    this.map.resetZoomBackground();

    // Show start new game modal again
    // Wait a little bit so the zoom out effect looks better
    setTimeout(() => {
      this.createNewGame();
    }, 500);
  }

  private setInitialView(): void {
    // Send GeoJSON data for all lines to setInitialView so it can create
    // a bounding box and then fit the map.
    const geoJSONAll = this.game
      .getLines()
      .map((line) => line.getGeoJSONData())
      .filter((geoJSON): geoJSON is FeatureCollection => geoJSON !== undefined);

    this.map.setInitialView(geoJSONAll);
  }

  private getUserSelectedLines(): string[] {
    const checkedValues: string[] = [];

    if (this.lineCheckboxes) {
      this.lineCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          checkedValues.push(checkbox.value);
        }
      });
    }

    return checkedValues;
  }

  private async loadLines(lines: string[]): Promise<void> {
    // If the metro is selected with other lines, count it as an entire line.
    const updatedLines = lines.length > 1 ? lines.map((line) => (line === "metroSplit" ? "metroFull" : line)) : lines;

    // Dynamically load lines based on input
    const selectedLines = updatedLines as (keyof typeof lineLoaders)[];
    const validSelectedLines = selectedLines.filter((lineKey) => lineKey in lineLoaders);
    const loadedLines = (await Promise.all(validSelectedLines.map((lineKey) => lineLoaders[lineKey]()))).flat();

    this.game.setLines(loadedLines);
  }

  private async loadMap(): Promise<void> {
    await this.map.initializeMap();
  }

  private setupEventListeners(): void {
    // If someone presses enter in the guess input field
    if (this.stationInput) {
      this.stationInput.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.handleGuess();
        }
      });
    }

    // Reset button
    const resetButton = document.querySelector<HTMLButtonElement>("#reset-game");
    if (resetButton) {
      resetButton.addEventListener("click", () => this.handleReset());
    }

    // Start new game button
    if (this.startButton) {
      this.startButton.addEventListener("click", () => this.handleStartGame());
    }

    // Listen to changes for line checkboxes when starting a new game
    if (this.lineCheckboxes) {
      this.lineCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => this.handleCheckbox());
      });
    }
  }

  private handleStartGame(): void {
    this.startNewGame();
  }

  private handleCheckbox(): void {
    const checkedValues: string[] = [];

    if (this.lineCheckboxes) {
      this.lineCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          checkedValues.push(checkbox.value);
        }
      });
    }

    if (this.startButton) {
      this.startButton.disabled = checkedValues.length === 0;
    }
  }

  private handleGuess(): void {
    if (this.stationInput) {
      const stationName = this.stationInput.value.trim();

      const result = this.game.makeGuess(stationName);

      if (result === GuessResult.Success) {
        this.stationInput.value = "";

        // Save to local storage
        saveCompletedGuesses(this.game.getCompletedGuesses());

        this.updateUI();

        const station = this.game.getStation(stationName);
        if (station) {
          this.map.markStationsAsGuessed(station);
          this.map.flyToStation(station);
        }
      } else {
        let styling = ["shake"];

        if (result === GuessResult.Duplicate) {
          styling.push("duplicate-guess");
        } else if (result === GuessResult.Invalid) {
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

  private updateUI(): void {
    console.log("Updating UI...");
  }
}
