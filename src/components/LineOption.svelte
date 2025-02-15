<script lang="ts">
  let { name, shortName, stations, color, icon, isSelected, onSelect } = $props();

  // Notify parent that this line is selected/deselected
  function handleSelect() {
    onSelect(shortName);
  }
</script>

<div class="line-option" style="border-left: 7px solid {color}" onclick={handleSelect} class:selected={isSelected}>
  <div class="line-info">
    <img src={icon} class="line-icon" />
    <span class="line-text-name">{name}</span>
  </div>
  <span class="line-text-stations">{stations} stationer</span>
</div>

<style>
  .line-option {
    display: flex;
    width: 100%;
    height: 50px;
    padding: 10px;
    background: #f1f2f3;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px;
    border-top: 1px solid #d8d8d8;
    border-right: 1px solid #d8d8d8;
    border-bottom: 1px solid #d8d8d8;
    margin-bottom: 8px;
    cursor: pointer;
  }

  .line-option:hover {
    background: #e8e8e8;
  }

  .line-option.selected {
    background: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    transform: scale(1.02);
    transition:
      background 0.3s ease,
      transform 0.3s ease;
  }

  .line-option.selected .line-text-name {
    color: #fff;
  }

  .line-option.selected .line-text-stations {
    color: #fff;
  }

  .line-option.selected:hover {
    background: #0056b3;
  }

  .line-info {
    display: flex;
    align-items: center;
  }

  .line-icon {
    width: 22px;
    height: 22px;
    padding: 2px;
    background: #000;
    border-radius: 4px;
    margin-right: 10px;
  }

  .line-text-name {
    font-size: 18px;
    color: #333;
  }

  .line-text-stations {
    font-size: 14px;
    color: #666;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .line-option {
      height: 50px;
    }

    .line-text-name {
      font-size: 16px;
    }

    .line-text-stations {
      font-size: 12px;
    }
  }
</style>
