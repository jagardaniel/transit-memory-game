import L from "leaflet";
import { Game } from "./models/Game";
import { Station } from "./models/Station";
import { loadGeoJSON } from "./helpers/geoJSONLoader";

export class MapManager {
  private _map: L.Map;
  private _stationMarkers: Map<string, L.CircleMarker>;
  private _game: Game;

  constructor(game: Game, initialCoordinates: [number, number], zoomLevel: number) {
    var renderer = L.svg({ padding: 50 });
    this._map = L.map("map", { renderer: renderer }).setView(initialCoordinates, zoomLevel);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 17,
      minZoom: 10,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(this._map);

    this._stationMarkers = new Map();
    this._game = game;
  }

  public initializeMap(): void {
    this.renderLines();
    this.renderStations();
  }

  private async renderLines(): Promise<void> {
    for (const line of this._game.lines) {
      try {
        const geoJSONData = await loadGeoJSON(line.geoJSONPath);
        const geoJSONLayer = L.geoJSON(geoJSONData, {
          style: { color: line.color, weight: 3 },
        });
        geoJSONLayer.addTo(this._map);
      } catch (error) {
        console.error(`Error loading GeoJSON for line "${line.name}":`, error);
      }
    }
  }

  private renderStations(): void {
    const locationMarker = this._map.createPane("locationMarker");
    locationMarker.style.zIndex = "700";

    const allStations = this._game.getStations();

    allStations.forEach((station) => {
      this.addStationMarker(station);
    });
  }

  private addStationMarker(station: Station): void {
    const { x, y } = station.coordinates;

    const marker = L.circleMarker([x, y], {
      color: "#4e4e4e",
      fillColor: "#ffffff",
      fillOpacity: 1.0,
      radius: 4,
      weight: 1,
      pane: "locationMarker",
    }).addTo(this._map);

    this._stationMarkers.set(station.name, marker);
  }

  public flyToStation(stationName: string): void {
    const station = this._game.getStation(stationName);
    if (station) {
      const { x, y } = station.coordinates;
      this._map.flyTo([x, y], 15);
    }
  }
}
