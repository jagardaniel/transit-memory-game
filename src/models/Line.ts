import type { Feature, FeatureCollection, Point } from "geojson";

export enum LineType {
  CommuterRail = "commuter-rail",
  LightRail = "light-rail",
  Metro = "metro",
  Tram = "tram",
}

export enum LineCity {
  Stockholm = "Stockholm",
}

// Alternative spelling for stations.
// Should probably be in another file
const stationCorrections: Record<string, string> = {
  "t centralen": "T-Centralen",
  centralen: "T-Centralen",

  // Metro specific
  "st eriksplan": "S:t Eriksplan",
  "sankt eriksplan": "S:t Eriksplan",
  "sundbyberg centrum": "Sundbybergs centrum",

  // Pendeltåg
  "uppsala centrum": "Uppsala C",
  "arlanda central": "Arlanda C",
  "stockholm södra": "Stockholm södra",

  // Spårväg City
  "nordiska museet": "Nordiska museet/Vasamuseet",
  vasamuseet: "Nordiska museet/Vasamuseet",
  liljevalchs: "Liljevalchs/Gröna Lund",
  "gröna lund": "Liljevalchs/Gröna Lund",

  // Roslagsbanan
  "stockholm östra": "Stockholms Östra",
};

export class Line {
  private name: string;
  private shortName: string;
  private city: LineCity;
  private color: string;
  private type: LineType;
  private geoJSONData: FeatureCollection;

  constructor(name: string, shortName: string, city: LineCity, color: string, type: LineType, geoJSONData: FeatureCollection) {
    this.name = name;
    this.shortName = shortName;
    this.city = city;
    this.color = color;
    this.type = type;
    this.geoJSONData = geoJSONData;
  }

  // It looks like the constructor can't be async so this is what ChatGPT recommended
  public static async create(name: string, shortName: string, city: LineCity, color: string, type: LineType): Promise<Line> {
    // GeoJSON file has to be placed in public/geojson/<city>/<type>/<shortName>.geojson
    // Example: public/geojson/stockholm/metro/red.geojson
    const filePath = `./geojson/${city.toLowerCase()}/${type}/${shortName}.geojson`;
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON data from ${filePath}`);
    }

    const geoJSONData: FeatureCollection = await response.json();
    return new Line(name, shortName, city, color, type, geoJSONData);
  }

  public getStations(): string[] {
    return this.geoJSONData.features
      .filter((feature) => feature.geometry.type === "Point" && feature.properties?.name)
      .map((feature) => feature.properties!.name as string);
  }

  // Check if the station name has an alternative spelling
  public correctStationName(stationName: string): string | null {
    return stationCorrections[stationName.toLowerCase()] ?? null;
  }

  private findStationFeature(stationName: string): Feature | undefined {
    return this.geoJSONData.features.find((feature: Feature) => feature.geometry.type === "Point" && feature.properties?.name === stationName);
  }

  public markStationAsGuessed(stationName: string): void {
    const feature = this.findStationFeature(stationName);

    if (feature) {
      if (feature.properties) {
        feature.properties.guessed = true;
      }
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

  public resetGuessedStations(): void {
    this.geoJSONData.features.forEach((feature: Feature) => {
      if (feature.geometry.type === "Point" && feature.properties) {
        feature.properties.guessed = false;
      }
    });
  }

  public getName(): string {
    return this.name;
  }

  public getShortName(): string {
    return this.shortName;
  }

  public getCity(): LineCity {
    return this.city;
  }

  public getColor(): string {
    return this.color;
  }

  public getType(): LineType {
    return this.type;
  }

  public getGeoJSONData(): FeatureCollection {
    return this.geoJSONData;
  }

  public getCorrections(): Record<string, string> {
    return stationCorrections;
  }

  public getBaseName(): string {
    return `${this.getShortName()}-${this.getType()}`;
  }
}
