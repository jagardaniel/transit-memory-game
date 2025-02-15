<script lang="ts">
  import GameMenu from "./GameMenu.svelte";
  import GuessInput from "./GuessInput.svelte";

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
  }

  /* Mobile */
  @media (max-width: 768px) {
    .overlay-bar {
      top: 2%;
      width: 100%;
      padding: 15px;
    }

    .overlay-menu {
      flex: 0 0 12%;
    }
  }
</style>
