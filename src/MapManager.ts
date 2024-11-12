import { Map as MapLibreMap, LngLatLike, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { Game } from "./models/Game";
import { Line } from "./models/Line";

export class MapManager {
  private map: MapLibreMap;
  private game: Game;
  private backgroundCoordinates: LngLatLike;
  private backgroundZoom: number;
  private isMapLoaded: boolean = false;

  constructor(game: Game) {
    this.game = game;
    this.isMapLoaded = false;

    // Coordinates and zoom used before the game has started
    this.backgroundCoordinates = [18.071136585570766, 59.32743910768781];
    this.backgroundZoom = 8;

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
              'Map tiles by <a target="_blank" href="https://carto.com/attributions">CARTO</a> | Data &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors | <a href="https://github.com/jagardaniel/transit-memory-game" target="_blank">GitHub repository</a>',
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

    // Emit event when the user stops dragging the map
    this.map.on("dragend", () => {
      this.emitCustomEvent("mapdragend");
    });
  }

  public async initializeMap(): Promise<void> {
    await this.waitForMapToLoad();
    await this.renderGeoJSONData();
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

  private emitCustomEvent(eventName: string, detail: any = {}) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
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
            "line-color": line.getColor(),
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
              line.getColor(), // Color if guessed
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
          minzoom: 11, // This is updated by setInitialView later
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

  // Create a bounding box with all the Points from the lines GeoJSON data
  // We can then use it to fit the zoom on the map without having to specify
  // coordinates or zoomlevel manually. ChatGPTs idea.
  public setInitialView(geoJSONData: any[]): void {
    let overallBounds: LngLatBounds | null = null;

    geoJSONData.forEach((data) => {
      const points = data.features.filter((feature: any) => feature.geometry.type === "Point").map((feature: any) => feature.geometry.coordinates);

      if (points.length > 0) {
        let bounds = new LngLatBounds(points[0], points[0]);
        points.forEach((point: [number, number]) => bounds.extend(point));

        // Merge bounds into the overall bounds
        if (overallBounds) {
          overallBounds.extend(bounds);
        } else {
          overallBounds = bounds;
        }
      }
    });

    if (overallBounds) {
      // Zoom to fit on the map
      this.map.fitBounds(overallBounds, { padding: 30, maxZoom: 12 });

      // Get zoom level after the animation is done from fitBounds
      this.map.once("moveend", () => {
        const fittingZoomLevel = this.map.getZoom();

        // Adjust zoom level for labels based on the fittingZoomLevel
        const labelZoomLevel = fittingZoomLevel + 0.2;
        const allLayers = this.map.getStyle().layers;

        if (allLayers) {
          allLayers.forEach((layer) => {
            if (layer.id.includes("labels")) {
              this.map.setLayerZoomRange(layer.id, labelZoomLevel, 24);
            }
          });
        }
      });
    }
  }

  public flyToStation(stationName: string): void {
    const coordinates = this.findStationCoordinates(stationName);
    const flyToZoomLevel = this.game.getFlyToZoomLevel(stationName);

    if (coordinates && flyToZoomLevel) {
      this.map.flyTo({
        center: [coordinates[0], coordinates[1]],
        zoom: flyToZoomLevel,
      });
    }
  }

  public resetZoomBackground(): void {
    this.map.flyTo({
      center: this.backgroundCoordinates,
      zoom: this.backgroundZoom,
    });
  }
}
