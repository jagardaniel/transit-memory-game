export interface StationData {
  name: string;
  x: number;
  y: number;
}

export interface LineData {
  name: string;
  color: string;
  geoJSONPath: string;
  stations: StationData[];
}

export interface LineStats {
  lineName: string;
  completedGuesses: number;
  totalStations: number;
}
