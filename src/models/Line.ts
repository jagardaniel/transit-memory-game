import { Feature, FeatureCollection, Point } from "geojson";

// Alternative spelling for stations.
// Since the list will not be too long it is probably easier to just keep it
// more centralized instead of specifying each alternatives for every line.
// Should probably be placed in a different file though.
const stationCorrections: Record<string, string> = {
  "t centralen": "T-Centralen",
  centralen: "T-Centralen",

  // Metro specific
  "st eriksplan": "S:t Eriksplan",
  "sankt eriksplan": "S:t Eriksplan",

  // Pendeltåg
  "uppsala centrum": "Uppsala C",
  "arlanda central": "Arlanda C",

  // Spårväg City
  "nordiska museet": "Nordiska museet/Vasamuseet",
  vasamuseet: "Nordiska museet/Vasamuseet",
  liljevalchs: "Liljevalchs/Gröna Lund",
  "gröna lund": "Liljevalchs/Gröna Lund",

  // Roslagsbanan
  "stockholm östra": "Stockholms Östra",
};

export enum LineType {
  CommuterRail = "commuter-rail",
  LightRail = "light-rail",
  Metro = "metro",
  Tram = "tram",
}

export class Line {
  private name: string;
  private shortName: string;
  private color: string;
  private type: LineType;
  private flyToZoomLevel: number; // Level to zoom into a station on this line
  private geoJSONData?: FeatureCollection;

  private constructor(name: string, shortName: string, color: string, type: LineType, flyToZoomLevel: number, geoJSONData: FeatureCollection) {
    this.name = name;
    this.shortName = shortName;
    this.color = color;
    this.type = type;
    this.flyToZoomLevel = flyToZoomLevel;
    this.geoJSONData = geoJSONData;
  }

  public getName(): string {
    return this.name;
  }

  public getShortName(): string {
    return this.shortName;
  }

  public getColor(): string {
    return this.color;
  }

  public getType(): LineType {
    return this.type;
  }

  public getFlyToZoomLevel(): number {
    return this.flyToZoomLevel;
  }

  public getCorrections(): Record<string, string> {
    return stationCorrections;
  }

  public getGeoJSONData(): FeatureCollection | undefined {
    return this.geoJSONData;
  }

  public getStations(): string[] {
    if (!this.geoJSONData) return [];

    return this.geoJSONData.features
      .filter((feature) => feature.geometry.type === "Point" && feature.properties?.name)
      .map((feature) => feature.properties!.name as string);
  }

  private findStationFeature(stationName: string): Feature | undefined {
    if (this.geoJSONData) {
      return this.geoJSONData.features.find((feature: Feature) => feature.geometry.type === "Point" && feature.properties?.name === stationName);
    }
    return undefined;
  }

  public markStationAsGuessed(stationName: string): void {
    const feature = this.findStationFeature(stationName);

    if (feature) {
      if (feature.properties) {
        feature.properties.guessed = true;
      }
    }
  }

  public resetGuessedStations(): void {
    if (this.geoJSONData) {
      this.geoJSONData.features.forEach((feature: Feature) => {
        if (feature.geometry.type === "Point" && feature.properties) {
          feature.properties.guessed = false;
        }
      });
    }
  }

  public getStationCoordinates(stationName: string): [number, number] | undefined {
    const feature = this.findStationFeature(stationName);

    if (feature && feature.geometry.type === "Point") {
      const pointGeometry = feature.geometry as Point;
      return pointGeometry.coordinates as [number, number];
    }
    return undefined;
  }

  // Check if the station name has an alternative spelling
  public correctStationName(stationName: string): string | null {
    return stationCorrections[stationName.toLowerCase()] ?? null;
  }

  // Static async factory method to create a Line instance
  public static async create(name: string, shortName: string, color: string, type: LineType, flyToZoomLevel: number = 13.5): Promise<Line> {
    // GeoJSON file has to be placed in public/geojson/<LineTyp>/<Line.getShortName()>.geojson
    // Example: public/geojson/metro/red.geojson
    const geoJSONPath = `./geojson/${type}/${shortName}.geojson`;
    const response = await fetch(geoJSONPath);
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON data from ${geoJSONPath}`);
    }

    const geoJSONData: FeatureCollection = await response.json();

    return new Line(name, shortName, color, type, flyToZoomLevel, geoJSONData);
  }
}
