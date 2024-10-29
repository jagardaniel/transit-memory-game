import { Station } from "./Station";

export class Line {
  private _name: string;
  private _stations: Station[];
  private _color: string;
  private _geoJSONPath: string;

  constructor(name: string, color: string, geoJSONPath: string) {
    this._name = name;
    this._stations = [];
    this._color = color;
    this._geoJSONPath = geoJSONPath;
  }

  public addStation(station: Station): void {
    this._stations.push(station);
  }

  get name(): string {
    return this._name;
  }

  get stations(): Station[] {
    return this._stations;
  }

  get color(): string {
    return this._color;
  }

  get geoJSONPath(): string {
    return this._geoJSONPath;
  }
}
