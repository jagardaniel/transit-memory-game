import { metroLines } from "./data/metro";
import { MapManager } from "./MapManager";
import { Game } from "./models/Game";

import "./style.css";
import "leaflet/dist/leaflet.css";

// Insert GameApp class here for handling the guess form and update UI with current stats

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game(metroLines);
  const mapManager = new MapManager(game, [59.32743910768781, 18.071136585570766], 11);

  mapManager.initializeMap();
});
