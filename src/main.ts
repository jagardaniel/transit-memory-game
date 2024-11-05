import { GameApp } from "./GameApp";
import { MapManager } from "./MapManager";
import { Game } from "./models/Game";
import { Line, LineType } from "./models/Line";
import "./style.css";

document.addEventListener("DOMContentLoaded", async () => {
  async function initializeApp() {
    const red_line = await Line.create("Röda linjen", "red", "#d71d24", LineType.Metro);
    const green_line = await Line.create("Gröna linjen", "green", "#148541", LineType.Metro);
    const blue_line = await Line.create("Blå linjen", "blue", "#007db8", LineType.Metro);
    const metroLines = [red_line, green_line, blue_line];

    const game = new Game(metroLines);
    const map = new MapManager(game, [18.071136585570766, 59.32743910768781], 10.7);

    new GameApp(game, map);
  }

  await initializeApp();
});
