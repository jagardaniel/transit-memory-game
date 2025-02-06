<script lang="ts">
  import type { LineStats } from "../lib/Game";
  import type { Line } from "../lib/Line";
  import { game, triggerGameUpdate } from "../lib/states.svelte";

  let totalCompletedGuesses = $state(0);
  let totalStations = $state(0);
  let lines: { line: Line; stats: LineStats | null }[] = $state([]);

  // Update data from game when triggerGameUpdate is changed
  // Probably ugly but could not find a better solution.
  $effect(() => {
    if (triggerGameUpdate.value >= 0) {
      // Set values for total stats
      totalCompletedGuesses = game.instance.getCompletedGuesses().length;
      totalStations = game.instance.getStations().length;

      // Get selected lines together with their stats
      lines = game.instance.getLines().map((line) => {
        const lineStats = game.instance.getLineStats(line.getName());
        return {
          line,
          stats: lineStats || null,
        };
      });
    }
  });
</script>

<!-- Only display if totalStations has "loaded" to avoid displaying 0/0 -->
{#if totalStations > 0}
  <div class="overlay-stats">
    <h3>Statistik</h3>

    {#each lines as line}
      <div class="stat-row">
        <span class="stat-name">{line.line.getName()}</span>
        <span class="stat-value" style="background: {line.line.getColor()}">
          {line.stats?.completedGuesses}/{line.stats?.totalStations}
        </span>
      </div>
    {/each}

    <!-- No need to display total stats with only one selected line -->
    {#if lines.length > 1}
      <div class="separator"></div>

      <div class="stat-row">
        <span class="stat-name">Total</span>
        <span class="stat-value" style="color: #666666">{totalCompletedGuesses}/{totalStations}</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .overlay-stats {
    position: absolute;
    top: 40px;
    right: 40px;
    width: 270px;
    background-color: #fff;
    padding: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    z-index: 20;
    transition: width 0.5s;
  }

  .separator {
    height: 2px;
    background-color: #f0f0f0;
    margin: 8px 0;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }

  .stat-name {
    color: #333;
  }

  .stat-value {
    font-size: 13px;
    color: #ffffff;
    font-weight: bold;
    border-radius: 3px;
    background: #f0f0f0;
    padding: 2px 4px;
  }
</style>
