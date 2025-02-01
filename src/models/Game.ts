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

  public setLines(newLines: Line[]): void {
    this.lines = newLines;
    this.completedGuesses.clear();
  }

  public setCompletedGuesses(newGuesses: string[]): void {
    const stations = new Set(this.getStations());
    this.completedGuesses = new Set(newGuesses.filter((guess) => stations.has(guess)));
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

  public getLines(): Line[] {
    return this.lines;
  }

  public getCompletedGuesses(): string[] {
    return Array.from(this.completedGuesses);
  }

  public clear(): void {
    this.completedGuesses.clear();
    this.lines = [];
  }
}
