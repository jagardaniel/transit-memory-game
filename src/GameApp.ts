import { clearCompletedGuesses, loadCompletedGuesses, saveCompletedGuesses } from "./helpers/localStorage";
import { MapManager } from "./MapManager";
import { Game } from "./models/Game";

export class GameApp {
  private _game: Game;
  private _mapManager: MapManager;
  private _stationInput: HTMLInputElement | null;

  constructor(game: Game, mapManager: MapManager) {
    this._game = game;
    this._mapManager = mapManager;
    this._stationInput = document.querySelector<HTMLInputElement>("#station-input");

    this.initializeGame();
    this.setupEventListeners();
  }

  private initializeGame(): void {
    // Load completed guesses from local storage
    const savedGuesses = loadCompletedGuesses();

    this._mapManager.initializeMap(savedGuesses);
    this._game.setInitialGuesses(savedGuesses);
    this.updateUI();

    if (this._stationInput) {
      this._stationInput.focus();
    }
  }

  private setupEventListeners(): void {
    if (this._stationInput) {
      this._stationInput.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.handleGuess();
        }
      });
    }

    const guessList = document.getElementById("guess-list");
    if (guessList) {
      guessList.addEventListener("click", (event) => this.handleGuessListClick(event));
    }

    const resetButton = document.querySelector<HTMLButtonElement>("#reset-game");
    if (resetButton) {
      resetButton.addEventListener("click", () => this.resetGame());
    }
  }

  private handleGuess(): void {
    if (this._stationInput) {
      const stationName = this._stationInput.value.trim();

      if (this._game.makeGuess(stationName)) {
        const station = this._game.getStation(stationName);
        if (!station) return;

        this._stationInput.value = "";

        // Save to local storage
        saveCompletedGuesses(this._game.completedGuesses);

        this.updateUI();
        this._mapManager.markStationAsGuessed(station.name);
        this._mapManager.flyToStation(stationName);
      } else {
        let styling = ["shake"];

        if (this._game.completedGuesses.some((x) => x.toLocaleLowerCase() === stationName.toLocaleLowerCase())) {
          styling.push("duplicate-guess");
        } else {
          styling.push("wrong-guess");
        }

        this._stationInput.classList.add(...styling);

        setTimeout(() => {
          if (this._stationInput) {
            this._stationInput.classList.remove(...styling);
          }
        }, 500);
      }
    }
  }

  private handleGuessListClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this._mapManager.flyToStation(target.innerText);
  }

  private resetGame(): void {
    // Clear local storage
    clearCompletedGuesses();

    this._game.reset();
    this.updateUI();

    if (this._stationInput) {
      this._stationInput.value = "";
    }

    this._mapManager.resetStations();
    this._mapManager.resetZoom();
  }

  private updateUI(): void {
    this.updateLineOverview();
    this.updateGuessList();
  }

  private updateLineOverview(): void {
    const lineStats = document.getElementById("line-stats") as HTMLParagraphElement;
    if (!lineStats) return;

    lineStats.innerHTML = "";

    this._game.getAllLineStats().forEach((line) => {
      const currentGuesses = line.completedGuesses;
      const totalStations = line.totalStations;
      const percentageComplete = Math.round((currentGuesses / totalStations) * 100);

      const listItem = document.createElement("li");
      listItem.textContent = `${line.lineName} - ${currentGuesses}/${totalStations} (${percentageComplete}%)`;
      lineStats.appendChild(listItem);
    });
  }

  private updateGuessList(): void {
    const guessList = document.getElementById("guess-list") as HTMLUListElement;
    const guessListTotal = document.getElementById("guess-list-total") as HTMLParagraphElement;
    if (!guessList || !guessListTotal) return;

    guessList.innerHTML = "";
    guessListTotal.innerHTML = "";

    const currentGuesses = this._game.completedGuesses.length;
    const totalStations = this._game.getStations().length;
    const percentageComplete = Math.round((currentGuesses / totalStations) * 100);

    guessListTotal.innerHTML = `${currentGuesses} av ${totalStations} stationer upptäckta (${percentageComplete}%)`;

    [...this._game.completedGuesses].reverse().forEach((station) => {
      const listItem = document.createElement("li");

      const colorIndicatorContainer = document.createElement("div");
      colorIndicatorContainer.className = "color-indicator-container";

      const stationColors = this._mapManager.getStationColors(station);
      stationColors?.forEach((color) => {
        const colorLine = document.createElement("span");
        colorLine.className = "color-line";
        colorLine.style.backgroundColor = color;
        colorIndicatorContainer.appendChild(colorLine);
      });

      listItem.appendChild(colorIndicatorContainer);
      listItem.appendChild(document.createTextNode(station));

      guessList.appendChild(listItem);
    });
  }
}
