<script lang="ts">
  import { onMount } from "svelte";
  import MapManager from "../lib/MapManager";
  import { mapManager } from "../lib/states.svelte";

  let mapContainer = $state<HTMLDivElement>();
  let manager: MapManager;

  onMount(() => {
    if (mapContainer) {
      manager = new MapManager(mapContainer);
      mapManager.instance = manager;
    }

    return () => {
      mapManager.instance?.destroy();
    };
  });
</script>

<div bind:this={mapContainer}></div>

<style>
  div {
    width: 100vw;
    height: 100vh;
  }
</style>
