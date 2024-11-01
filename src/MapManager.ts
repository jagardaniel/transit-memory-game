import L from "leaflet";
import { Game } from "./models/Game";
import { Station } from "./models/Station";
import { loadGeoJSON } from "./helpers/geoJSONLoader";

export class MapManager {
  private _map: L.Map;
  private _stationMarkers: Map<string, L.CircleMarker>;
  private _stationLabels: Map<string, L.CircleMarker>;
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

    // Layer for station markers
    const markerPane = this._map.createPane("stationMarker");
    markerPane.style.zIndex = "700";

    // Layer for station text labels
    const labelPane = this._map.createPane("stationLabel");
    labelPane.style.zIndex = "800";

    this.toggleLabelVisibility(this._map.getZoom());

    this._map.on("zoomend", () => {
      this.toggleLabelVisibility(this._map.getZoom());
    });

    this._game = game;
  }

  public initializeMap(completedGuesses: string[]): void {
    this.renderLines();
    this.renderStations();

    // Show labels for already guessed stations on page refresh
    completedGuesses.forEach((stationName) => {
      this.addStationLabel(stationName);
      this.markStationAsGuessed(stationName);
    });
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
    const allStations = this._game.getStations();

    allStations.forEach((station) => {
      this.addStationMarker(station);
    });
  }

  private toggleLabelVisibility(zoomLevel: number): void {
    const labelPane = this._map.getPane("stationLabel");
    if (labelPane) {
      labelPane.style.display = zoomLevel >= 13 ? "block" : "none";
    }
  }

  private addStationMarker(station: Station): void {
    const { x, y } = station.coordinates;

    const marker = L.circleMarker([x, y], {
      color: "#4e4e4e",
      fillColor: "#ffffff",
      fillOpacity: 1.0,
      radius: 4,
      weight: 1,
      pane: "stationMarker",
    }).addTo(this._map);

    this._stationMarkers.set(station.name, marker);
  }

  public markStationAsGuessed(stationName: string): void {
    const marker = this._stationMarkers.get(stationName);

    // Mark completed guess as green for now. Doesn't look very good but it is something
    if (marker) {
      marker.setStyle({
        color: "#ffffff",
        fillColor: "green",
        fillOpacity: 0.9,
        radius: 4,
        weight: 2,
        pane: "stationMarker",
      });
    }
  }

  public addStationLabel(stationName: string): void {
    const marker = this._stationMarkers.get(stationName);
    if (!marker) return;

    marker
      .bindTooltip(stationName, {
        permanent: true,
        direction: "center",
        className: "station-tooltip",
        offset: L.point(0, -12),
        pane: "stationLabel",
      })
      .openTooltip();

    this._stationLabels.set(stationName, marker);
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
