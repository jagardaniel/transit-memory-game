import L from "leaflet";
import { Game } from "./models/Game";
import { Station } from "./models/Station";
import { loadGeoJSON } from "./helpers/geoJSONLoader";

export class MapManager {
  private _map: L.Map;
  private _stationMarkers: Map<string, L.CircleMarker>;
  private _stationLabels: Map<string, L.Marker>;
  private _game: Game;
  private _initialCoordinates: [number, number];
  private _intialZoomLevel: number;

  constructor(game: Game, initialCoordinates: [number, number], zoomLevel: number) {
    this._initialCoordinates = initialCoordinates;
    this._intialZoomLevel = zoomLevel;

    var renderer = L.svg({ padding: 50 });
    this._map = L.map("map", { renderer: renderer, zoomControl: false }).setView(this._initialCoordinates, this._intialZoomLevel);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 17,
      minZoom: 11,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(this._map);
    L.control.zoom({ position: "bottomright" }).addTo(this._map);

    this._stationMarkers = new Map();
    this._stationLabels = new Map();
    this._game = game;
  }

  public initializeMap(completedGuesses: string[]): void {
    this.renderLines();
    this.renderStations();

    // Show labels for already guessed stations on page refresh
    completedGuesses.forEach((stationName) => this.addStationLabel(stationName));
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

  public addStationLabel(stationName: string): void {
    // Get the "real" station name from the object since the stationMarkers keys are case sensitive
    const station = this._game.getStation(stationName);
    if (!station) return;

    const marker = this._stationMarkers.get(station.name);
    if (!marker) return;

    const labelIcon = L.divIcon({
      className: "station-label",
      html: `<span>${station.name}</span>`,
    });

    const labelMarker = L.marker(marker.getLatLng(), { icon: labelIcon });
    this._stationLabels.set(station.name, labelMarker);
    labelMarker.addTo(this._map);
  }

  public removeAllLabels(): void {
    this._stationLabels.forEach((labelMarker) => labelMarker.remove());
    this._stationLabels.clear();
  }

  public flyToStation(stationName: string): void {
    const station = this._game.getStation(stationName);
    if (station) {
      const { x, y } = station.coordinates;
      this._map.flyTo([x, y], 15);
    }
  }

  public resetZoom(): void {
    this._map.flyTo(this._initialCoordinates, this._intialZoomLevel);
  }
}
