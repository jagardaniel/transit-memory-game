import { metroLines } from "./data/metro";
import { GameApp } from "./GameApp";
import { MapManager } from "./MapManager";
import { Game } from "./models/Game";

import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game(metroLines);
  const mapManager = new MapManager(game, [18.071136585570766, 59.32743910768781], 10.7);

  new GameApp(game, mapManager);
});
