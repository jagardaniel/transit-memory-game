<script lang="ts">
  import { onMount } from "svelte";
  import MapManager from "../lib/MapManager";
  import type { Line } from "../models/Line";
  import type { FeatureCollection } from "geojson";
  import type { LngLatLike } from "maplibre-gl";

  let mapContainer = $state<HTMLDivElement>();
  let mapManager = $state<MapManager>();

  onMount(() => {
    if (mapContainer) {
      mapManager = new MapManager(mapContainer);
    }

    return () => {
      mapManager?.destroy();
    };
  });

  // Draw GeoJSON data on the map for each selected line
  export async function drawLines(lines: Line[]) {
    lines.forEach((line) => {
      mapManager?.drawGeoJSON(line.getBaseName(), line.getColor(), line.getGeoJSONData());
    });
  }

  // Clear all GeoJSON related layers on the map
  export function clear() {
    mapManager?.clear();
  }

  // Set the center/zoom to get a default view that covers all selected lines
  export function fitView(lines: Line[]) {
    const geoJSONData: FeatureCollection[] = [];

    for (const line of lines) {
      geoJSONData.push(line.getGeoJSONData());
    }

    mapManager?.fitView(geoJSONData);
  }

  // Zoom back to the default view
  export function defaultView() {
    mapManager?.defaultView();
  }

  // Fly to specified coordinates
  export function flyToCoords(coordinates: LngLatLike) {
    mapManager?.flyToCoords(coordinates);
  }

  // Update the source with new GeoJSON data
  export function updateGeoJSON(baseName: string, geoJSONData: FeatureCollection) {
    mapManager?.updateGeoJSON(baseName, geoJSONData);
  }
</script>

<div bind:this={mapContainer}></div>

<style>
  div {
    width: 100vw;
    height: 100vh;
  }
</style>
