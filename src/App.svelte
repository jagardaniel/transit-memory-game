<script lang="ts">
  import "maplibre-gl/dist/maplibre-gl.css";

  import Map from "./components/Map.svelte";
  import { completedGuesses, hasSeenIntro, isGameStarted, selectedLines } from "./lib/localStorage";
  import { game, guessState, mapManager, triggerGameUpdate } from "./lib/states.svelte";
  import OverlayBar from "./components/OverlayBar.svelte";
  import { LINES } from "./data/lines";
  import { Line } from "./lib/Line";
  import { get } from "svelte/store";
  import type { FeatureCollection } from "geojson";
  import { GuessResult } from "./lib/Game";
  import LineSelector from "./components/LineSelector.svelte";
  import Introduction from "./components/Introduction.svelte";
  import { showToast, toast } from "./lib/toast.svelte";
  import Toast from "./components/Toast.svelte";
  import type { LngLatLike } from "maplibre-gl";
  import GameStats from "./components/GameStats.svelte";

  const isGameReady = $derived(mapManager.instance && $isGameStarted);

  $effect(() => {
    if (isGameReady) {
      loadGame();
    }
  });

  async function loadGame() {
    const linesName = get(selectedLines);

    if (linesName.length > 0) {
      // Set selected lines
      await setLines(linesName);

      // Set completed guesses from local storage
      game.instance.setCompletedGuesses(get(completedGuesses));

      const lines = game.instance.getLines();

      // Draw lines and station markers on the map
      drawLines(lines);

      // Find initial view that fit all selected lines
      flyToFitView(lines);

      // Mark completed guesses as guessed on the map
      markStationsAsGuessed(game.instance.getCompletedGuesses());

      // Trigger update for components using game
      triggerGameUpdate.value++;

      // OpenStreetMap data for Saltsjöbanan does not include Slussen right now (under construction)
      // Show this information
      const includesSaltsjobanan = lines.some((line) => line.getName() === "Saltsjöbanan");

      if (includesSaltsjobanan) {
        setTimeout(() => {
          showToast("Saltsjöbanan innehåller inte station Slussen för tillfället (under ombyggnad)", 4000);
        }, 300);
      }
    }
  }

  function resetGame() {
    game.instance.clear();
    guessState.input = "";

    isGameStarted.set(false);
    selectedLines.set([]);
    completedGuesses.set([]);

    mapManager.instance?.clear();
    mapManager.instance?.initialView();
  }

  // Add lines to the game if they exist in LINES
  async function setLines(lineNames: string[]) {
    const linesToLoad = lineNames.flatMap((lineKey) => {
      const availableLines = LINES[lineKey as keyof typeof LINES];

      return availableLines?.map((line) => Line.create(line.name, line.shortName, line.city, line.color, line.type));
    });

    const loadedLines = await Promise.all(linesToLoad);
    game.instance.setLines(loadedLines);
  }

  // Draw GeoJSON data on the map for each selected line
  function drawLines(lines: Line[]) {
    // Get suggested min zoom level for station markers based on the bounds for all selected lines
    let markersMinZoom = getMarkersMinZoom(lines);

    if (!markersMinZoom) {
      markersMinZoom = 10;
    }

    lines.forEach((line) => {
      mapManager.instance?.drawGeoJSON(line.getBaseName(), line.getColor(), markersMinZoom, line.getGeoJSONData());
    });
  }

  // Get camera (center/zoom) for all specified lines
  function getCameraForBounds(lines: Line[]): { center: LngLatLike; zoom: number } | null {
    const geoJSONData: FeatureCollection[] = lines.map((line) => line.getGeoJSONData());

    // Get the overall bounding box based on the GeoJSON data from all selected lines
    const boundingBox = mapManager.instance?.getMergedBounds(geoJSONData);
    if (!boundingBox) return null;

    // Get desired center and zoom level for the bounding box
    const view = mapManager.instance?.getCameraForBounds(boundingBox);
    if (!view) return null;

    return { center: view.center, zoom: view.zoom };
  }

  // Fly to a map view that covers all selected lines
  function flyToFitView(lines: Line[]) {
    const camera = getCameraForBounds(lines);

    if (camera) {
      mapManager.instance?.flyToCoords(camera.center, camera.zoom);
    }
  }

  // Get a suggested minimum zoom level for station markers based on selected lines
  function getMarkersMinZoom(lines: Line[]): number | null {
    const camera = getCameraForBounds(lines);
    if (!camera) return null;

    return camera.zoom < 11 ? camera.zoom + 0.1 : camera.zoom - 1;
  }

  function flyToStation(station: string) {
    const lines = game.instance.getLines();

    // A station can exist on multiple lines. Find the line that has the closest zoom level
    // and use it for the zoom and coordinates
    if (lines) {
      let matchCoordinates: LngLatLike | null = null;
      let highestZoom = 0;

      for (const line of lines) {
        const coordinates = line.getStationCoordinates(station);

        if (coordinates) {
          // Get the appropriate zoom level for the station based on the line it belongs to
          const bounds = mapManager.instance?.getBounds(line.getGeoJSONData());
          if (!bounds) return;

          const zoom = mapManager.instance?.getStationZoomForBounds(bounds);
          if (zoom && zoom > highestZoom) {
            highestZoom = zoom;
            matchCoordinates = coordinates;
          }
        }
      }

      if (matchCoordinates && highestZoom !== 0) {
        mapManager.instance?.flyToCoords(matchCoordinates, highestZoom);
      }
    }
  }

  function handleGuess() {
    const guess = guessState.input.trim();
    const result = game.instance.makeGuess(guess);

    if (result === GuessResult.Success) {
      // Update completed guesses to local storage
      completedGuesses.set(game.instance.getCompletedGuesses());

      // Clear input form
      guessState.input = "";

      // Get the "real" case sensitive name
      const station = game.instance.getStation(guess);

      if (station) {
        markStationsAsGuessed(station);
        flyToStation(station);
      }

      // Trigger update for components using game
      triggerGameUpdate.value++;
    } else if (result === GuessResult.Duplicate) {
      guessState.status = "duplicate";
    } else {
      guessState.status = "invalid";
    }

    // Clear styling
    setTimeout(() => (guessState.status = "default"), 400);
  }

  // Update the GeoJSON data and map source for each line that contains the station
  function markStationsAsGuessed(stations: string | string[]): void {
    const stationArray = Array.isArray(stations) ? stations : [stations];
    const lines = game.instance.getLines();

    if (lines) {
      stationArray.forEach((stationName) => {
        for (const line of lines) {
          line.markStationAsGuessed(stationName);
          mapManager.instance?.updateGeoJSON(line.getBaseName(), line.getGeoJSONData());
        }
      });
    }
  }
</script>

<!-- Always display map -->
<Map />

<!-- Show modal selector for new games -->
{#if !$isGameStarted}
  <LineSelector />
{/if}

<!-- Show guess input, menu and stats if game is started -->
{#if $isGameStarted}
  <OverlayBar onGuess={handleGuess} onReset={resetGame} />
  <GameStats />

  <!--- Show introduction on first game -->
  {#if !$hasSeenIntro}
    <Introduction />
  {/if}
{/if}

<!-- Show toast message -->
{#if toast.value}
  <Toast message={toast.value.message} duration={toast.value.duration} />
{/if}
