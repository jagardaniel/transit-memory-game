<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { game } from "../lib/states.svelte";
  import { showToast } from "../lib/toast.svelte";

  let { onReset } = $props();

  let visible = $state(false);
  let dropdownRef = $state<HTMLDivElement>();

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  function toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    visible = !visible;
  }

  // Hide dropdown menu on click
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      visible = false;
    }
  }

  function handleReset() {
    visible = false;

    const message = "Är du säker på att du vill starta om? Detta kommer återställa alla dina nuvarande gissningar.";

    if (confirm(message)) {
      onReset();
    }
  }

  async function handleCopyStats() {
    visible = false;

    let text = "";

    const lines = game.instance.getLines();

    lines.forEach((line) => {
      const lineName = line.getName();
      const lineStats = game.instance.getLineStats(lineName);

      if (lineStats) {
        text += `${lineName}: ${lineStats.completedGuesses}/${lineStats.totalStations}\n`;
      }
    });

    if (lines.length > 1) {
      const totalCompletedGuesses = game.instance.getCompletedGuesses().length;
      const totalStations = game.instance.getStations().length;

      text += `\nTotalt: ${totalCompletedGuesses}/${totalStations}`;
    } else {
      // Remove last newline character
      text = text.slice(0, -1);
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast("Resultet har kopierats till urklippet!", 2500);
    } catch (error) {
      console.error("Unable to copy text to clipbaord");
    }
  }
</script>

<button class="menu-button" onclick={toggleDropdown}>
  <img src="icons/menu.svg" alt="Game menu" />
</button>

{#if visible}
  <div class="dropdown-menu" bind:this={dropdownRef}>
    <div class="dropdown-item" onclick={handleReset}>Nytt spel</div>
    <div class="dropdown-item" onclick={handleCopyStats}>Kopiera resultat</div>
  </div>
{/if}

<style>
  .menu-button {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    border: 1px solid rgba(85, 85, 85, 0.5);
    background: #fff;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  }

  .menu-button:hover {
    background: #f0f0f0;
    border-radius: 10px;
  }

  .menu-button img {
    margin-top: 5px;
    width: 20px;
    height: 20px;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: -45px;
    background: #fff;
    border-radius: 5px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    z-index: 100;
    margin-top: 10px;
    font-size: 15px;
  }

  .dropdown-item {
    padding: 8px 16px;
    cursor: pointer;
  }

  .dropdown-item:hover {
    background: #f0f0f0;
  }
</style>
