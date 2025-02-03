<script lang="ts">
  import "maplibre-gl/dist/maplibre-gl.css";

  import Map from "./components/Map.svelte";
  import { isGameStarted, selectedLines, completedGuesses, hasSeenIntro } from "./lib/stores";
  import StartModal from "./components/StartModal.svelte";
  import { Game, GuessResult } from "./models/Game";
  import { get } from "svelte/store";
  import { LINES } from "./data/Lines";
  import { Line } from "./models/Line";
  import OverlayBar from "./components/OverlayBar.svelte";
  import { guessState, mapManager } from "./lib/states.svelte";
  import OverlayIntro from "./components/OverlayIntro.svelte";
  import type { FeatureCollection } from "geojson";

  let game = $state<Game>(new Game());

  const isGameReady = $derived(mapManager && $isGameStarted);

  $effect(() => {
    if (isGameReady) {
      loadGame();
    }
  });

  async function addLines(lineNames: string[]) {
    const linesToLoad = lineNames.flatMap((lineKey) => {
      const availableLines = LINES[lineKey as keyof typeof LINES];

      return availableLines?.map((line) => Line.create(line.name, line.shortName, line.city, line.color, line.type));
    });

    const loadedLines = await Promise.all(linesToLoad);
    game.setLines(loadedLines);
  }

  async function loadGame() {
    const linesName = get(selectedLines);

    if (linesName.length > 0) {
      // Load selected lines
      await addLines(linesName);

      // Set completed guesses from local storage
      game.setCompletedGuesses(get(completedGuesses));

      const lines = game.getLines();

      // Draw lines and station markers on the map
      await drawLines(lines);

      // Set some map options based on the selected lines and then to fly to it
      setupOptions(lines);
      mapManager.instance?.flyToCoords(mapManager.instance?.getLinesCenter(), mapManager.instance?.getLinesZoom());

      // Mark completed guesses as guessed on the map
      markStationsAsGuessed(game.getCompletedGuesses());
    } else {
      console.error("No lines selected. This should not be happening.");
    }
  }

  function resetGame() {
    game.clear();
    guessState.input = "";

    isGameStarted.set(false);
    selectedLines.set([]);
    completedGuesses.set([]);

    mapManager.instance?.clear();
    mapManager.instance?.defaultView();
  }

  function handleGuess() {
    const guess = guessState.input.trim();
    const result = game.makeGuess(guess);

    if (result === GuessResult.Success) {
      // Update completed guesses to local storage
      completedGuesses.set(game.getCompletedGuesses());

      // Clear input form
      guessState.input = "";

      // Get the "real" case sensitive name
      const station = game.getStation(guess);

      if (station) {
        // Mark station as guessed and zoom in
        markStationsAsGuessed(station);
        flyToStation(station);
      }
    } else if (result === GuessResult.Duplicate) {
      guessState.status = "duplicate";
    } else {
      guessState.status = "invalid";
    }

    // Clear styling
    setTimeout(() => (guessState.status = "default"), 400);
  }

  // Draw GeoJSON data on the map for each selected line
  async function drawLines(lines: Line[]) {
    lines.forEach((line) => {
      mapManager.instance?.drawGeoJSON(line.getBaseName(), line.getColor(), line.getGeoJSONData());
    });
  }

  // Set center/zoom options for selected lines
  function setupOptions(lines: Line[]) {
    const geoJSONData: FeatureCollection[] = [];

    for (const line of lines) {
      geoJSONData.push(line.getGeoJSONData());
    }

    mapManager.instance?.setupOptions(geoJSONData);
  }

  // Update the GeoJSON data and map source for each line
  function markStationsAsGuessed(stations: string | string[]): void {
    const stationArray = Array.isArray(stations) ? stations : [stations];
    const lines = game.getLines();

    if (lines) {
      stationArray.forEach((stationName) => {
        for (const line of lines) {
          line.markStationAsGuessed(stationName);
          mapManager.instance?.updateGeoJSON(line.getBaseName(), line.getGeoJSONData());
        }
      });
    }
  }

  // Find coordinates for a station and then fly (zoom) to it
  function flyToStation(station: string) {
    const lines = game.getLines();

    // A station can exist on multiple lines but they should be in the same location
    // so only care about first match
    if (lines) {
      for (const line of lines) {
        const coordinates = line.getStationCoordinates(station);
        if (coordinates) {
          mapManager.instance?.flyToCoords(coordinates, mapManager.instance?.getStationZoom());
        }
      }
    }
  }
</script>

<main>
  <!-- Always display map -->
  <Map />

  <!-- Show modal for new games -->
  {#if !$isGameStarted}
    <StartModal />
  {/if}

  <!-- Show guess input and menu if game is started -->
  {#if $isGameStarted}
    <OverlayBar onGuess={handleGuess} onReset={resetGame} />
  {/if}

  <!-- Show introduction only if game is started and it hasn't been seen -->
  {#if $isGameStarted && !$hasSeenIntro}
    <OverlayIntro />
  {/if}
</main>
