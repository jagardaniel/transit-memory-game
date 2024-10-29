import { Station } from "./Station";
import { Line } from "./Line";
import { initializeLines } from "../helpers/initializeLines";
import { LineData, LineStats } from "../types";

export class Game {
  private _lines: Line[];
  private _completedGuesses: Set<string>;

  constructor(lineData: LineData[]) {
    this._lines = initializeLines(lineData);
    this._completedGuesses = new Set();
  }

  public setInitialGuesses(guesses: string[]): void {
    this._completedGuesses = new Set(guesses);
  }

  public makeGuess(stationName: string): boolean {
    let guess = false;

    for (const line of this._lines) {
      const station = line.stations.find((station) => station.name.toLowerCase() === stationName.toLowerCase());
      if (station) {
        if (!this._completedGuesses.has(station.name)) {
          this._completedGuesses.add(station.name);
          guess = true;
        }
      }
    }

    return guess;
  }

  public getLine(lineName: string): Line | null {
    const line = this._lines.find((line) => line.name.toLowerCase() === lineName.toLowerCase());
    return line ?? null;
  }

  public getStation(stationName: string): Station | null {
    for (const line of this._lines) {
      const station = line.stations.find((station) => station.name.toLowerCase() === stationName.toLowerCase());
      if (station) return station;
    }
    return null;
  }

  public getStations(): Station[] {
    const uniqueStations = new Set<string>();
    const allStations: Station[] = [];

    for (const line of this._lines) {
      for (const station of line.stations) {
        if (!uniqueStations.has(station.name)) {
          uniqueStations.add(station.name);
          allStations.push(station);
        }
      }
    }

    return allStations;
  }

  public getAllLineStats(): LineStats[] {
    return this._lines.map((line) => {
      const totalStations = line.stations.length;
      const completedGuesses = line.stations.filter((station) => this._completedGuesses.has(station.name)).length;
      return {
        lineName: line.name,
        completedGuesses,
        totalStations,
      };
    });
  }

  public reset(): void {
    this._completedGuesses.clear();
  }

  get lines(): Line[] {
    return this._lines;
  }

  get completedGuesses(): string[] {
    return Array.from(this._completedGuesses);
  }
}
