<script lang="ts">
  import { onMount } from "svelte";
  import { guessState } from "../lib/states.svelte";

  let { onGuess } = $props();

  let inputRef = $state<HTMLInputElement>();

  onMount(() => {
    inputRef?.focus();
  });

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && guessState.input.trim() !== "") {
      event.preventDefault();
      onGuess();
    }
  }
</script>

<input
  class="guess-input"
  type="text"
  placeholder="Gissa station..."
  bind:this={inputRef}
  bind:value={guessState.input}
  onkeydown={handleKeyDown}
  class:guess-invalid={guessState.status === "invalid"}
  class:guess-duplicate={guessState.status === "duplicate"}
  class:shake={guessState.status !== "default"}
/>

<style>
  .guess-input {
    width: 100%;
    height: 45px;
    padding-left: 43px;
    font-size: 1rem;
    border: 1px solid rgba(85, 85, 85, 0.5);
    border-radius: 10px;
    color: #363636;
    background: #ffffff;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

    /* Icon */
    background-image: url("/icons/train.svg");
    background-repeat: no-repeat;
    background-position: 10px center;
  }

  .guess-duplicate {
    border: 2px solid #e5d700 !important;
  }

  .guess-invalid {
    border: 2px solid red !important;
  }

  .shake {
    animation: shake 0.2s ease-in-out 0s 2;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(0.5rem);
    }
    75% {
      transform: translateX(-0.5rem);
    }
  }
</style>
