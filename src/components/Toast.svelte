<script lang="ts">
  import { onMount } from "svelte";

  let { message, duration = 2000 } = $props();

  let visible = $state(false);

  onMount(() => {
    visible = true;
    setTimeout(() => {
      visible = false;
    }, duration);
  });
</script>

{#if visible}
  <div class="toast">{message}</div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 16px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 100;
    opacity: 1;
    transition: opacity 0.5s;
  }
</style>
