import { describe, expect, it } from "vitest";
import { Station } from "../src/models/Station";

describe("Station", () => {
  it("Create a new station", () => {
    const station = new Station("Slussen", 59.319493, 18.072327);
    expect(station.name).toBe("Slussen");
    expect(station.coordinates).toEqual({ x: 59.319493, y: 18.072327 });
  });
});
