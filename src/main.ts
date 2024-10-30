import { metroLines } from "./data/metro";
import { clearCompletedGuesses, loadCompletedGuesses, saveCompletedGuesses } from "./helpers/localStorage";
import { MapManager } from "./MapManager";
import { Game } from "./models/Game";

import "./style.css";
import "leaflet/dist/leaflet.css";

class GameApp {
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

    this._game.setInitialGuesses(savedGuesses);
    this.updateUI();
    this._mapManager.initializeMap(savedGuesses);
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

    const resetButton = document.querySelector<HTMLButtonElement>("#reset-game");
    if (resetButton) {
      resetButton.addEventListener("click", () => this.resetGame());
    }
  }

  private handleGuess(): void {
    if (this._stationInput) {
      const stationName = this._stationInput.value.trim();
      if (this._game.makeGuess(stationName)) {
        this._stationInput.value = "";

        // Save to local storage
        saveCompletedGuesses(this._game.completedGuesses);

        this.updateUI();
        this._mapManager.addStationLabel(stationName);
        this._mapManager.flyToStation(stationName);
      } else {
        this._stationInput.classList.add("shake");

        setTimeout(() => {
          if (this._stationInput) {
            this._stationInput.classList.remove("shake");
          }
        }, 500);
      }
    }
  }

  private resetGame(): void {
    // Clear local storage
    clearCompletedGuesses();

    this._game.reset();
    this.updateUI();

    if (this._stationInput) {
      this._stationInput.value = "";
    }

    this._mapManager.removeAllLabels();
    this._mapManager.resetZoom();
  }

  private updateUI(): void {
    const tempStats = document.querySelector<HTMLInputElement>("#stats-temp");
    const currentGuessed = this._game.completedGuesses.length;
    const totalStations = this._game.getStations().length;

    if (tempStats) {
      tempStats.innerHTML = `${currentGuessed} of ${totalStations} stations found`;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game(metroLines);
  const mapManager = new MapManager(game, [59.32743910768781, 18.071136585570766], 11);

  new GameApp(game, mapManager);
});
