import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { Game } from "./models/Game";
import { loadGeoJSON } from "./helpers/geoJSONLoader";

export class MapManager {
  private _map: maplibregl.Map;
  private _game: Game;
  private _initialCoordinates: [number, number];
  private _initialZoomLevel: number;
  private _stationsGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  constructor(game: Game, initialCoordinates: [number, number], initialZoomLevel: number, completedGuesses: string[] = []) {
    this._game = game;

    this._initialCoordinates = initialCoordinates;
    this._initialZoomLevel = initialZoomLevel;

    this._map = new maplibregl.Map({
      container: "map",
      style: {
        version: 8,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: ["https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"],
            tileSize: 256,
            attribution:
              'Map tiles by <a target="_blank" href="https://carto.com/attributions">CARTO</a>. Data &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors',
          },
        },
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        layers: [
          {
            id: "base-map",
            type: "raster",
            source: "raster-tiles",
          },
        ],
      },
      center: this._initialCoordinates,
      zoom: this._initialZoomLevel,
      minZoom: 10,
      maxZoom: 15,
    });
  }

  private async onMapLoad(completedGuesses: string[] = []): Promise<void> {
    this._map.on("load", async () => {
      this.initializeStationsGeoJSON(completedGuesses);

      // I'm going to be completely honest, I don't know why renderLines need to be async and how it works
      // But renderLines should always be run first
      await this.renderLines();

      this.renderStationMarkers();
      this.renderStationLabels();
    });
  }

  public initializeMap(completedGuesses: string[] = []): void {
    this.onMapLoad(completedGuesses);
  }

  private initializeStationsGeoJSON(completedGuesses: string[]): void {
    // We will need to modify the GeoJSON station data to mark a station (feature) as guessed
    // I think it will be easier to have the data as an instance variable
    // completedGuesses can be sent in to mark a station as guessed on the initial load
    const features: GeoJSON.Feature[] = [];

    this._game.getStations().forEach((station) => {
      const { x, y } = station.coordinates;
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [y, x],
        },
        properties: {
          name: station.name,
          guessed: completedGuesses.includes(station.name),
        },
      });
    });

    this._stationsGeoJSON.features = features;
  }

  private async renderLines(): Promise<void> {
    for (const line of this._game.lines) {
      try {
        const geoJSONData = await loadGeoJSON(line.geoJSONPath);

        this._map.addSource(line.name, {
          type: "geojson",
          data: geoJSONData,
        });

        this._map.addLayer({
          id: line.name,
          type: "line",
          source: line.name,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": line.color,
            "line-width": 3,
            "line-opacity": 1,
          },
        });
      } catch (error) {
        console.error(`Error loading GeoJSON for line "${line.name}":`, error);
      }
    }
  }

  private renderStationMarkers(): void {
    this._map.addSource("stations", {
      type: "geojson",
      data: this._stationsGeoJSON,
    });

    this._map.addLayer({
      id: "station-markers",
      type: "circle",
      source: "stations",
      paint: {
        "circle-radius": 3,
        "circle-color": "#ffffff",
        "circle-stroke-width": 2,
        "circle-stroke-color": [
          "case",
          ["boolean", ["get", "guessed"], false],
          "green", // Color if guessed
          "#000000", // Color if not guessed
        ],
      },
    });
  }

  private renderStationLabels(): void {
    this._map.addLayer({
      id: "station-labels",
      type: "symbol",
      source: "stations",
      layout: {
        "text-field": ["get", "name"],
        "text-size": 13,
        "text-anchor": "bottom",
        "text-offset": [0, -0.5],
      },
      paint: {
        "text-color": "#000000",
        "text-halo-color": "white",
        "text-halo-width": 2,
        "text-halo-blur": 1,
      },
      filter: ["==", ["get", "guessed"], true], // Only show if station is guessed
      minzoom: 11,
    });
  }

  public markStationAsGuessed(stationName: string): void {
    // I don't think there is an easier way to modify data with a GeoJSON source
    // Markers seems to be an option for the station marker and labels but I was unable
    // to place them at the correct layer (zIndex). ChatGPTs suggestion:
    const featureIndex = this._stationsGeoJSON.features.findIndex((feature) => {
      return feature.properties && feature.properties.name === stationName;
    });

    if (featureIndex !== -1) {
      if (this._stationsGeoJSON.features[featureIndex].properties) {
        this._stationsGeoJSON.features[featureIndex].properties.guessed = true;

        const source = this._map.getSource("stations");
        if (source) {
          (source as maplibregl.GeoJSONSource).setData(this._stationsGeoJSON);
        }
      }
    } else {
      console.warn(`Station "${stationName}" not found in GeoJSON data.`);
    }
  }

  public resetStations(): void {
    this._stationsGeoJSON.features.forEach((feature) => {
      if (feature.properties) {
        feature.properties.guessed = false;
      }
    });

    const source = this._map.getSource("stations");
    if (source) {
      (source as maplibregl.GeoJSONSource).setData(this._stationsGeoJSON);
    }
  }

  public flyToStation(stationName: string): void {
    const station = this._game.getStation(stationName);
    if (station) {
      this._map.flyTo({
        center: [station.coordinates.y, station.coordinates.x],
        zoom: 14,
      });
    }
  }

  public resetZoom(): void {
    this._map.flyTo({
      center: this._initialCoordinates,
      zoom: this._initialZoomLevel,
    });
  }
}
