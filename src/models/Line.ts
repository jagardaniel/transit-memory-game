import { Feature, FeatureCollection, Point } from "geojson";

export enum LineType {
  Metro = "metro",
}

export class Line {
  private name: string;
  private shortName: string;
  private color: string;
  private type: LineType;
  private geoJSONData?: FeatureCollection;

  private constructor(name: string, shortName: string, color: string, type: LineType, geoJSONData: FeatureCollection) {
    this.name = name;
    this.shortName = shortName;
    this.color = color;
    this.type = type;
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

  // Static async factory method to create a Line instance
  public static async create(name: string, shortName: string, color: string, type: LineType): Promise<Line> {
    // GeoJSON file has to be placed in public/geojson/<LineTyp>/<Line.getShortName()>.geojson
    // Example: public/geojson/metro/red.geojson
    const geoJSONPath = `./geojson/${type}/${shortName}.geojson`;
    const response = await fetch(geoJSONPath);
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON data from ${geoJSONPath}`);
    }

    const geoJSONData: FeatureCollection = await response.json();

    return new Line(name, shortName, color, type, geoJSONData);
  }
}
