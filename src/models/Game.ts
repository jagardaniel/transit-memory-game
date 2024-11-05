import { Line } from "./Line";

export class Game {
  private lines: Line[];
  private completedGuesses: Set<string>;

  constructor(lines: Line[]) {
    this.lines = lines;
    this.completedGuesses = new Set();
  }

  public setInitialGuesses(guesses: string[]): void {
    const stations = new Set(this.getStations());
    this.completedGuesses = new Set(guesses.filter((guess) => stations.has(guess)));
  }

  public makeGuess(stationName: string): boolean {
    const station = this.getStation(stationName);

    if (station && !this.completedGuesses.has(station)) {
      this.completedGuesses.add(station);
      return true;
    }

    return false;
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
      const station = line.getStations().find((station) => station.toLowerCase() === stationName.toLowerCase());
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

  public reset(): void {
    this.completedGuesses.clear();
  }
}
