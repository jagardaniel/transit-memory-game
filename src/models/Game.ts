import { LineStats } from "../types";
import { Line } from "./Line";

export enum GuessResult {
  Success = "success",
  Duplicate = "duplicate",
  Invalid = "invalid",
}

export class Game {
  private lines: Line[];
  private completedGuesses: Set<string>;

  constructor() {
    this.lines = [];
    this.completedGuesses = new Set();
  }

  public setInitialGuesses(guesses: string[]): void {
    const stations = new Set(this.getStations());
    this.completedGuesses = new Set(guesses.filter((guess) => stations.has(guess)));
  }

  public setLines(newLines: Line[]): void {
    this.lines = newLines;
    this.reset();
  }

  public makeGuess(stationName: string): GuessResult {
    // Check if the name has an alternative spelling
    const correctedName = this.lines.reduce((name, line) => line.correctStationName(name) ?? name, stationName);

    const station = this.getStation(correctedName);

    if (!station) {
      return GuessResult.Invalid;
    }

    if (this.completedGuesses.has(station)) {
      return GuessResult.Duplicate;
    }

    this.completedGuesses.add(station);
    return GuessResult.Success;
  }

  public getCompletedGuesses(): string[] {
    return Array.from(this.completedGuesses);
  }

  public getLine(lineName: string): Line | null {
    const line = this.lines.find((line) => line.getName().toLowerCase() === lineName.toLowerCase());
    return line ?? null;
  }

  public getStation(stationName: string): string | null {
    for (const line of this.lines) {
      // Check if there is an alternative spelling for the station name
      const correctedName = line.correctStationName(stationName);

      const nameToMatch = correctedName ?? stationName;

      const station = line.getStations().find((station) => station.toLowerCase() === nameToMatch.toLowerCase());
      if (station) return station;
    }

    return null;
  }

  public getStations(): string[] {
    const uniqueStations = new Set<string>();
    const allStations: string[] = [];

    for (const line of this.lines) {
      for (const station of line.getStations()) {
        if (!uniqueStations.has(station)) {
          uniqueStations.add(station);
          allStations.push(station);
        }
      }
    }

    return allStations;
  }

  public getLineStats(lineName: string): LineStats | null {
    const line = this.getLine(lineName);

    if (line) {
      const completedGuesses = line.getStations().filter((station) => this.completedGuesses.has(station)).length;
      const totalStations = line.getStations().length;

      return {
        completedGuesses,
        totalStations,
      };
    }

    return null;
  }

  public getStationLineColors(stationName: string): string[] {
    const colors: string[] = [];

    for (const line of this.lines) {
      const stationExistsOnLine = line.getStations().some((station) => station.toLowerCase() === stationName.toLowerCase());

      if (stationExistsOnLine) {
        colors.push(line.getColor());
      }
    }

    return colors;
  }

  // Get a lines flyToZoomLevel by station name. A station can exist on multiple lines
  // but they should always be pretty similar so just return the first one we can find
  public getFlyToZoomLevel(stationName: string): number | null {
    for (const line of this.getLines()) {
      const stations = line.getStations();

      const station = stations.find((station) => station === stationName);
      if (station) {
        return line.getFlyToZoomLevel();
      }
    }

    return null;
  }

  public getLines(): Line[] {
    return this.lines;
  }

  public reset(): void {
    this.completedGuesses.clear();
  }
}
