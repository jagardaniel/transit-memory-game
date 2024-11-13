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
  private lineSelections: HTMLDivElement[] | null;
  private startButton: HTMLButtonElement | null;
  private startModal: HTMLDivElement | null;
  private sidebar: HTMLDivElement | null;
  //private guessList: HTMLUListElement | null;
  private lineList: HTMLUListElement | null;
  private selectedLines: Set<string>;

  constructor() {
    this.game = new Game();
    this.map = new MapManager(this.game);

    this.stationInput = document.querySelector<HTMLInputElement>("#station-input");
    this.searchContainer = document.querySelector<HTMLDivElement>("#search");
    this.lineSelections = Array.from(document.querySelectorAll(".line-option")) as HTMLDivElement[];
    this.startButton = document.querySelector<HTMLButtonElement>("#start-button");
    this.startModal = document.querySelector<HTMLDivElement>("#modal-overlay");
    this.sidebar = document.querySelector<HTMLDivElement>("#sidebar");
    //this.guessList = document.querySelector<HTMLUListElement>("#guess-list");
    this.lineList = document.querySelector<HTMLUListElement>("#line-list");
    this.selectedLines = new Set<string>();

    this.setupEventListeners();
    this.setupMapListeners();
    this.checkGameStatus();
  }

  private checkGameStatus(): void {
    // Check if a game has already started in local storage
    const newGame = loadNewGameState();

    if (newGame) {
      this.createNewGame();
    } else {
      this.loadCurrentGame();
    }
  }

  private createNewGame(): void {
    if (this.startModal) {
      this.startModal.classList.add("show");
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

    this.updateUI();
    this.toggleSidebar(true);
  }

  private async startNewGame(): Promise<void> {
    if (this.startModal) {
      this.startModal.classList.remove("show");
    }

    const userSelectedLines = this.getSelectedLines();
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

    // Clear selections in new game modal
    this.selectedLines.clear();
    if (this.lineSelections) {
      this.lineSelections.forEach((lineSelection) => {
        lineSelection.classList.remove("selected");
      });
    }

    if (this.startButton) {
      this.startButton.disabled = true;
    }

    this.updateUI();
    this.toggleSidebar(true);
  }

  private resetGame(): void {
    // Clear local storage
    clearAll();

    // Hide text input form
    if (this.searchContainer) {
      this.searchContainer.style.display = "none";
    }

    this.game.reset();

    this.map.resetMap();
    this.map.resetZoomBackground();

    // Show start new game modal again
    this.toggleSidebar(false);
    this.createNewGame();
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

  private toggleSidebar(show: boolean): void {
    if (this.sidebar) {
      if (show) {
        this.sidebar.classList.remove("hidden");
      } else {
        this.sidebar.classList.add("hidden");
      }
    }
  }

  private getSelectedLines(): string[] {
    return Array.from(this.selectedLines);
  }

  private async loadLines(lines: string[]): Promise<void> {
    // Dynamically load lines based on input
    const selectedLines = lines as (keyof typeof lineLoaders)[];
    const loadedLines = (await Promise.all(selectedLines.map((lineKey) => lineLoaders[lineKey]()))).flat();

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

    // Listen to click events on line-options
    if (this.lineSelections) {
      this.lineSelections.forEach((lineSelection) => {
        lineSelection.addEventListener("click", () => this.handleLineSelection(lineSelection));
      });
    }
  }

  private setupMapListeners(): void {
    // "mapdragend" event from MapManager
    window.addEventListener("mapdragend", () => {
      if (this.stationInput) {
        this.stationInput.focus();
      }
    });
  }

  private handleStartGame(): void {
    this.startNewGame();
  }

  private handleLineSelection(lineSelection: HTMLDivElement): void {
    const line = lineSelection.getAttribute("data-line");

    if (line) {
      if (this.selectedLines.has(line)) {
        this.selectedLines.delete(line);
        lineSelection.classList.remove("selected");
      } else {
        this.selectedLines.add(line);
        lineSelection.classList.add("selected");
      }

      if (this.startButton) {
        this.startButton.disabled = this.selectedLines.size === 0;
      }
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
          this.stationInput!.classList.remove(...styling);
        }, 500);
      }
    }
  }

  private handleReset(): void {
    const reset = confirm("Är du säker på att du vill börja om? Detta återställer alla dina nuvarande gissningar.");
    if (reset) this.resetGame();
  }

  private updateUI(): void {
    this.updateLineList();
    //this.updateGuessList();
  }

  private updateLineList(): void {
    if (!this.lineList) return;
    this.lineList.innerHTML = "";

    // Sort lines based on stations but group the metro lines together at the top. By ChatGPT obviously:
    const lines = this.game.getLines();
    const metroLines = lines.filter((line) => line.getType() === "metro").sort((a, b) => b.getStations().length - a.getStations().length);
    const otherLines = lines.filter((line) => line.getType() !== "metro").sort((a, b) => b.getStations().length - a.getStations().length);

    // Combine grouped and sorted lines
    const sortedLines = [...metroLines, ...otherLines];

    // Check if there is only metro lines
    const hasNonMetroLines = lines.some((line) => line.getType() !== "metro");

    sortedLines.forEach((line) => {
      const listItem = document.createElement("li");
      listItem.classList.add("line-item");

      const lineStats = this.game.getLineStats(line.getName());
      const lineName = (hasNonMetroLines && line.getType() === "metro" ? "T: " : "") + line.getName();

      if (lineStats) {
        const nameElement = document.createElement("span");
        nameElement.textContent = lineName;

        const statsElement = document.createElement("span");
        statsElement.classList.add("stats-element");
        statsElement.style.backgroundColor = line.getColor();
        statsElement.textContent = `${lineStats.completedGuesses}/${lineStats.totalStations}`;

        listItem.appendChild(nameElement);
        listItem.appendChild(statsElement);
      }

      this.lineList!.appendChild(listItem);
    });

    // Add row for total stats
    const completedGuesses = this.game.getCompletedGuesses().length;
    const allStations = this.game.getStations().length;

    const listItem = document.createElement("li");
    listItem.classList.add("line-item");
    listItem.style.marginTop = "5px";
    listItem.style.paddingTop = "10px";
    listItem.style.borderTop = "1px solid #f3f3f3";

    const nameElement = document.createElement("span");
    nameElement.textContent = "Totalt";

    const statsElement = document.createElement("span");
    statsElement.classList.add("stats-element");
    statsElement.style.backgroundColor = "#f0f0f0";
    statsElement.style.color = "#666666";
    statsElement.textContent = `${completedGuesses}/${allStations}`;

    listItem.appendChild(nameElement);
    listItem.appendChild(statsElement);
    this.lineList!.appendChild(listItem);
  }

  /*
  private updateGuessList(): void {
    if (!this.guessList) return;
    this.guessList.innerHTML = "";

    this.game
      .getCompletedGuesses()
      .reverse()
      .forEach((guess) => {
        const listItem = document.createElement("li");
        listItem.classList.add("guess-item");

        const stationName = document.createElement("span");
        stationName.textContent = guess;
        stationName.classList.add("station-name");

        // Get all line colors for the station
        const lineDetails = this.game.getStationLineDetails(guess);

        const colorBoxes = document.createElement("div");
        colorBoxes.style.display = "flex";

        lineDetails.forEach((detail) => {
          const colorBox = document.createElement("span");
          colorBox.classList.add("line-color-box");
          colorBox.style.backgroundColor = detail.color;

          // This part could probably be moved to a more central place
          let iconName = "rail.svg";
          if (detail.type == LineType.Metro) {
            iconName = "metro.svg";
          }

          const icon = document.createElement("img");
          icon.src = `./icons/${iconName}`;
          icon.classList.add("line-color-icon");

          colorBox.appendChild(icon);
          colorBoxes.appendChild(colorBox);
        });

        listItem.appendChild(stationName);
        listItem.appendChild(colorBoxes);

        this.guessList!.appendChild(listItem);
      });
  }
      */
}
