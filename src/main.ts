import { GameApp } from "./GameApp";
import { loadMetroSplit } from "./LineSetup";
import { MapManager } from "./MapManager";
import { Game } from "./models/Game";
import "./style.css";

document.addEventListener("DOMContentLoaded", async () => {
  async function initializeApp() {
    // Set to load metro lines right now. Should be dynamic in the future.
    const metroLines = await loadMetroSplit();

    const game = new Game(metroLines);
    const map = new MapManager(game, [18.071136585570766, 59.32743910768781], 10.7);

    new GameApp(game, map);
  }

  await initializeApp();
});
