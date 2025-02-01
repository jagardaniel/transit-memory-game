<script lang="ts">
  import GuessInput from "./GuessInput.svelte";
  import GameMenu from "./GameMenu.svelte";

  let { onGuess, onReset } = $props();
</script>

<div class="overlay-bar">
  <div class="overlay-input">
    <GuessInput {onGuess} />
  </div>
  <div class="overlay-menu">
    <GameMenu {onReset} />
  </div>
</div>

<style>
  .overlay-bar {
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 6px;
    z-index: 10;
    width: 400px;
    display: flex;
    justify-content: center;
  }

  .overlay-input {
    flex: 0 0 85%;
  }

  .overlay-menu {
    flex: 0 0 10%;
    margin-left: 5px;
    /*
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
    border: 1px solid rgba(85, 85, 85, 0.5);
    border-radius: 10px;
    background: #fff;
    */
  }

  .overlay-menu:hover {
    background: #f6f6f6;
    cursor: pointer;
  }
</style>
