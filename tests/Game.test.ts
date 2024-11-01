import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "../src/models/Game";
import { Line } from "../src/models/Line";
import { Station } from "../src/models/Station";
import { LineData } from "../src/types";

const lineData: LineData[] = [
  {
    name: "Röda linjen",
    color: "#d71d24",
    geoJSONPath: "metro/red.geojson",
    stations: [
      { name: "Ropsten", x: 59.357301, y: 18.102216 },
      { name: "Universitetet", x: 59.365571, y: 18.054888 },
      { name: "Zinkensdamm", x: 59.317776, y: 18.050151 },
      { name: "T-Centralen", x: 59.330945, y: 18.059266 },
    ],
  },
  {
    name: "Gröna linjen",
    color: "#148541",
    geoJSONPath: "metro/green.geojson",
    stations: [
      { name: "Alvik", x: 59.333633, y: 17.980269 },
      { name: "Odenplan", x: 59.3428, y: 18.0486 },
      { name: "T-Centralen", x: 59.330945, y: 18.059266 },
    ],
  },
];

describe("Game", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game(lineData);
  });

  it("Create game with no guesses", () => {
    expect(game.lines.length).toBe(2);
    expect(game.completedGuesses.length).toBe(0);
  });

  it("Create game and insert initial guesses", () => {
    game.setInitialGuesses(["Alvik", "Zinkensdamm"]);
    expect(game.completedGuesses).toEqual(["Alvik", "Zinkensdamm"]);
    expect(game.completedGuesses.length).toBe(2);
  });

  it("Guess correct station", () => {
    const guess = game.makeGuess("Odenplan");
    expect(guess).toBe(true);
    expect(game.completedGuesses).toContain("Odenplan");
    expect(game.completedGuesses.length).toBe(1);
  });

  it("Guess wrong station", () => {
    const guess = game.makeGuess("Bergshamra");
    expect(guess).toBe(false);
    expect(game.completedGuesses.length).toBe(0);
  });

  it("Guess already guessed station", () => {
    game.makeGuess("Ropsten");
    const guess = game.makeGuess("Ropsten");
    expect(guess).toBe(false);
    expect(game.completedGuesses.length).toBe(1);
  });

  it("Guess station that exists on multiple lines", () => {
    const firstGuess = game.makeGuess("T-Centralen");
    const secondGuess = game.makeGuess("T-Centralen");
    expect(firstGuess).toBe(true);
    expect(secondGuess).toBe(false);
    expect(game.completedGuesses.length).toBe(1);
  });

  it("Get existing line", () => {
    const line = game.getLine("Röda linjen");
    expect(line).toBeInstanceOf(Line);
    expect(line?.name).toBe("Röda linjen");
  });

  it("Get non-existing line", () => {
    const line = game.getLine("Oranga linjen");
    expect(line).toBeNull();
  });

  it("Get existing station", () => {
    const station = game.getStation("Ropsten");
    expect(station).toBeInstanceOf(Station);
    expect(station?.name).toBe("Ropsten");
  });

  it("Get non-existing station", () => {
    const station = game.getStation("Göteborg");
    expect(station).toBeNull();
  });

  it("Get station in lower case", () => {
    const station = game.getStation("ropsten");
    expect(station).toBeInstanceOf(Station);
    expect(station?.name).toBe("Ropsten");
  });

  it("Get all unique stations", () => {
    const stations = game.getStations();
    const station1 = stations.filter((e) => e.name === "T-Centralen").length;
    const station2 = stations.filter((e) => e.name === "Alvik").length;
    expect(stations.length).toBe(6);
    expect(station1).toBe(1);
    expect(station2).toBe(1);
  });

  it("Get correct line stats for each line", () => {
    game.setInitialGuesses(["T-Centralen", "Alvik", "Odenplan", "Ropsten"]);
    const lineStats = game.getAllLineStats();
    expect(lineStats.length).toBe(2);

    expect(lineStats[0]).toEqual({
      lineName: "Röda linjen",
      completedGuesses: 2,
      totalStations: 4,
    });

    expect(lineStats[1]).toEqual({
      lineName: "Gröna linjen",
      completedGuesses: 3,
      totalStations: 3,
    });
  });

  it("Reset game", () => {
    game.setInitialGuesses(["T-Centralen", "Ropsten"]);
    game.makeGuess("Alvik");
    expect(game.completedGuesses.length).toBe(3);

    game.reset();
    expect(game.completedGuesses.length).toBe(0);
  });
});
