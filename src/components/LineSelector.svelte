<script lang="ts">
  import { LINES_MENU } from "../data/lines";
  import { isGameStarted, selectedLines } from "../lib/localStorage";
  import LineOption from "./LineOption.svelte";

  let localSelectedLines = $state<string[]>([]);

  function startGame() {
    isGameStarted.set(true);
    selectedLines.set(localSelectedLines);
  }

  // Handle line selection
  function toggleLineSelection(lineName: string) {
    if (localSelectedLines.includes(lineName)) {
      localSelectedLines = localSelectedLines.filter((line) => line !== lineName);
    } else {
      localSelectedLines = [...localSelectedLines, lineName];
    }
  }
</script>

<div class="modal-overlay">
  <div class="modal-content">
    <h2>Nytt spel</h2>
    <p>Välj en eller flera linjer:</p>

    <div class="line-options">
      {#each LINES_MENU as { name, shortName, stations, color, icon }}
        <LineOption {name} {shortName} {stations} {color} {icon} isSelected={localSelectedLines.includes(shortName)} onSelect={toggleLineSelection} />
      {/each}
    </div>

    <button class="start-button" onclick={startGame} disabled={localSelectedLines.length === 0}> Starta spel </button>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
  }

  .line-options {
    margin-top: 10px;
  }

  .start-button {
    font-size: 16px;
    border: 1px solid #0173ec;
    border-radius: 5px;
    padding: 10px;
    background: #007bff;
    color: #fff;
    cursor: pointer;
    margin-top: 10px;
  }

  .start-button:hover:enabled {
    background-color: #0056b3;
  }

  .start-button:disabled {
    border: 1px solid #d8d8d8;
    background-color: #e4e4e4;
    cursor: not-allowed;
    color: #666;
  }

  .start-button:active {
    transform: scale(1.05);
  }

  .start-button:disabled:active {
    transform: none;
  }

  .start-button:focus {
    outline: none;
  }
</style>
