import { LineData } from "../types";
import { Line } from "../models/Line";
import { Station } from "../models/Station";

export function initializeLines(lineData: LineData[]): Line[] {
  return lineData.map((lineInfo) => {
    const line = new Line(lineInfo.name, lineInfo.color, lineInfo.geoJSONPath);
    lineInfo.stations.forEach((stationInfo) => {
      line.addStation(new Station(stationInfo.name, stationInfo.x, stationInfo.y));
    });
    return line;
  });
}
