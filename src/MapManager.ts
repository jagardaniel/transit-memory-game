import { Map as MapLibreMap, LngLatLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { Game } from "./models/Game";
import { Line } from "./models/Line";

export class MapManager {
  private map: MapLibreMap;
  private game: Game;
  private backgroundCoordinates: LngLatLike;
  private backgroundZoom: number;
  private initialCoordinates: LngLatLike;
  private initialZoom: number;
  private isMapLoaded: boolean = false;

  constructor(game: Game) {
    this.game = game;
    this.isMapLoaded = false;

    // Coordinates and zoom used before the game has started
    this.backgroundCoordinates = [18.071136585570766, 59.32743910768781];
    this.backgroundZoom = 8;

    // Set by initializeMap later on
    this.initialCoordinates = [0, 0];
    this.initialZoom = 0;

    this.map = new MapLibreMap({
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
      center: this.backgroundCoordinates,
      zoom: this.backgroundZoom,
      maxZoom: 15,
    });

    // Disable map rotation
    this.map.dragRotate.disable();
    this.map.keyboard.disable();
    this.map.touchZoomRotate.disableRotation();

    this.map.on("load", () => {
      this.isMapLoaded = true;
    });
  }

  public async initializeMap(initialCoordinates: LngLatLike, initialZoom: number): Promise<void> {
    this.initialCoordinates = initialCoordinates;
    this.initialZoom = initialZoom;

    await this.waitForMapToLoad();
    await this.renderGeoJSONData();

    // Fly to default position
    this.map.flyTo({
      center: this.initialCoordinates,
      zoom: this.initialZoom,
    });
  }

  // There is an issue where initializeMap tries to run renderGeoJSONData before the map has loaded completely
  // It results in an empty map and a pretty boring game. This is what ChatGPT suggested to fix this issue.
  private async waitForMapToLoad(): Promise<void> {
    if (this.isMapLoaded) {
      return;
    }

    // Wait for load event
    await new Promise<void>((resolve) => {
      this.map.on("load", () => {
        this.isMapLoaded = true;
        resolve();
      });
    });
  }

  private async renderGeoJSONData(): Promise<void> {
    const lines = this.game.getLines();

    for (const line of lines) {
      const geoJSONData = line.getGeoJSONData();
      const baseName = `${line.getShortName()}-${line.getType()}`;

      if (geoJSONData) {
        // Add source for each line
        this.map.addSource(baseName, {
          type: "geojson",
          data: geoJSONData,
        });

        // Draw lines
        this.map.addLayer({
          id: baseName + "-lines",
          type: "line",
          source: baseName,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": ["get", "color"],
            "line-width": 3,
            "line-opacity": 1,
          },
          filter: ["==", "$type", "LineString"],
        });

        this.map.addLayer({
          id: baseName + "-markers",
          type: "circle",
          source: baseName,
          paint: {
            "circle-radius": 4,
            "circle-color": [
              "case",
              ["boolean", ["get", "guessed"], false],
              ["get", "markedColor"], // Color if guessed
              "#ffffff", // Color if not guessed
            ],
            "circle-stroke-color": [
              "case",
              ["boolean", ["get", "guessed"], false],
              "#ffffff", // Color if guessed
              "#000000", // Color if not guessed
            ],
            "circle-stroke-width": [
              "case",
              ["boolean", ["get", "guessed"], false],
              2, // If guessed
              1, // If not guessed
            ],
          },
          filter: ["==", "$type", "Point"],
        });

        // Add text labels for each station. Only displayed if "guessed" property is set to true
        this.map.addLayer({
          id: baseName + "-labels",
          type: "symbol",
          source: baseName,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 11,
            "text-anchor": "bottom",
            "text-offset": [0, -0.5],
          },
          paint: {
            "text-color": "#000000",
            "text-halo-color": "white",
            "text-halo-width": 2,
            "text-halo-blur": 1,
          },
          filter: ["==", ["get", "guessed"], true],
          minzoom: 11,
        });
      } else {
        console.error(`GeoJSON data for line "${line.getName()}" is undefined.`);
      }
    }
  }

  public findStationCoordinates(stationName: string): [number, number] | undefined {
    const lines = this.game.getLines();

    // Same station (with slightly different coordinates) can exist on multiple lines.
    // They are close enough so just get the first one we can find.
    for (const line of lines) {
      const coordinates = line.getStationCoordinates(stationName);
      if (coordinates) {
        return coordinates;
      }
    }

    console.error(`Station "${stationName}" not found in any line.`);
    return undefined;
  }

  public markStationsAsGuessed(stations: string | string[]): void {
    const stationArray = Array.isArray(stations) ? stations : [stations];

    stationArray.forEach((stationName) => {
      const lines = this.game.getLines();

      for (const line of lines) {
        line.markStationAsGuessed(stationName);
        this.updateGeoJSON(line);
      }
    });
  }

  public resetMap(): void {
    // Remove source and layers except for the base tiles
    const allLayers = this.map.getStyle().layers;
    const allSources = this.map.getStyle().sources;

    if (allLayers) {
      allLayers.reverse().forEach((layer) => {
        if (layer.id != "base-map") {
          this.map.removeLayer(layer.id);
        }
      });
    }

    if (allSources) {
      for (const source in allSources) {
        if (source != "raster-tiles") {
          this.map.removeSource(source);
        }
      }
    }
  }

  private updateGeoJSON(line: Line): void {
    const geoJSONData = line.getGeoJSONData();
    if (geoJSONData) {
      const baseName = `${line.getShortName()}-${line.getType()}`;
      const source = this.map.getSource(baseName);
      if (source) {
        (source as maplibregl.GeoJSONSource).setData(geoJSONData);
      }
    }
  }

  public flyToStation(stationName: string): void {
    const coordinates = this.findStationCoordinates(stationName);
    if (coordinates) {
      this.map.flyTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 14,
      });
    }
  }

  public resetZoom(): void {
    this.map.flyTo({
      center: this.initialCoordinates,
      zoom: this.initialZoom,
    });
  }

  public resetZoomBackground(): void {
    this.map.flyTo({
      center: this.backgroundCoordinates,
      zoom: this.backgroundZoom,
    });
  }
}
