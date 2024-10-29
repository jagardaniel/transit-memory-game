import { describe, it, expect } from "vitest";
import { Station } from "../src/models/Station";
import { Line } from "../src/models/Line";

describe("Line", () => {
  it("Create line without stations", () => {
    const line = new Line("Röda linjen", "#d71d24", "metro/red.geojson");

    expect(line.name).toBe("Röda linjen");
    expect(line.stations.length).toBe(0);
    expect(line.color).toBe("#d71d24");
    expect(line.geoJSONPath).toBe("metro/red.geojson");
  });

  it("Create line with two stations", () => {
    const line = new Line("Gröna linjen", "#148541", "metro/green.geojson");
    const station1 = new Station("Gamla stan", 59.32316, 18.067617);
    const station2 = new Station("Alvik", 59.333633, 17.980269);

    line.addStation(station1);
    line.addStation(station2);

    expect(line.stations.length).toBe(2);
    expect(line.stations).toContain(station1);
    expect(line.stations).toContain(station2);
  });
});
