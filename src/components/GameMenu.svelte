<script lang="ts">
  import { onDestroy, onMount } from "svelte";

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
</script>

<button class="menu-button" onclick={toggleDropdown}>
  <img src="icons/menu.svg" alt="Game menu" />
</button>

{#if visible}
  <div class="dropdown-menu" bind:this={dropdownRef}>
    <div class="dropdown-item" onclick={onReset}>Nytt spel</div>
    <div class="dropdown-item">Kopiera resultat</div>
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
