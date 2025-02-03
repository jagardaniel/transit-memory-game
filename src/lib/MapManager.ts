import maplibregl, { LngLatBounds, type LngLatLike } from "maplibre-gl";
import type { FeatureCollection } from "geojson";

class MapManager {
  private map: maplibregl.Map;
  private initialZoom: number;
  private initialCenter: LngLatLike;

  private linesCenter: LngLatLike;
  private linesZoom: number;
  private stationZoom: number;

  constructor(container: HTMLDivElement) {
    this.initialCenter = [18.071136585570766, 59.32743910768781]; // Default to Stockholm
    this.initialZoom = 7;

    // Updated later based on selected lines in setupOptions
    // Used to set the initial view when a game is started
    this.linesCenter = [0, 0];
    this.linesZoom = 0;
    this.stationZoom = 0;

    this.map = new maplibregl.Map({
      container: container,
      style: {
        version: 8,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: ["https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"],
            tileSize: 256,
            attribution: `Map tiles by <a target="_blank" href="https://carto.com/attributions">CARTO</a> |
                Data &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors |
                <a href="https://github.com/jagardaniel/transit-memory-game" target="_blank">GitHub repository</a>`,
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
      center: this.initialCenter,
      zoom: this.initialZoom,
      maxZoom: 15,
      minZoom: 7,
    });

    // Disable map rotation
    this.map.dragRotate.disable();
    this.map.keyboard.disable();
    this.map.touchZoomRotate.disableRotation();
  }

  public destroy(): void {
    this.map.remove();
  }

  public clear(): void {
    // Remove source and layers except for the base tiles
    const layers = this.map.getStyle().layers;
    const sources = this.map.getStyle().sources;

    if (layers) {
      layers.reverse().forEach((layer) => {
        if (layer.id != "base-map") {
          this.map.removeLayer(layer.id);
        }
      });
    }

    if (sources) {
      for (const source in sources) {
        if (source != "raster-tiles") {
          this.map.removeSource(source);
        }
      }
    }
  }

  public drawGeoJSON(baseName: string, lineColor: string, geoJSONData: FeatureCollection) {
    // Add source layer
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
        "line-color": lineColor,
        "line-width": 3,
        "line-opacity": 1,
      },
      filter: ["==", "$type", "LineString"],
    });

    // Draw station markers
    this.map.addLayer({
      id: baseName + "-markers",
      type: "circle",
      source: baseName,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8,
          3, // At zoom level 8, the radius is 3
          12,
          4, // At zoom level 12, the radius is 4
        ],
        "circle-color": [
          "case",
          ["boolean", ["get", "guessed"], false],
          lineColor, // Color if guessed
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

    // Draw text labels for stations. Only visible if guessed property is set to true
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
  }

  // Setup options based on GeoJSON from selected lines
  public setupOptions(geoJSONData: FeatureCollection[]): void {
    let overallBounds: LngLatBounds | null = null;

    // Create a bounding box with all the GeoJSON points
    for (const data of geoJSONData) {
      const points = data.features.filter((feature: any) => feature.geometry.type === "Point").map((feature: any) => feature.geometry.coordinates);

      if (points.length > 0) {
        const bounds = new LngLatBounds(points[0], points[0]);
        points.forEach((point: [number, number]) => bounds.extend(point));

        // Merge bounds into the overall bounds
        if (overallBounds) {
          overallBounds.extend(bounds);
        } else {
          overallBounds = bounds;
        }
      }
    }

    if (overallBounds) {
      // Get zoom level and the desired center for the bounding box
      const cameraOptions = this.map.cameraForBounds(overallBounds, {
        padding: 30,
        maxZoom: 13,
      });

      if (cameraOptions?.zoom !== undefined && cameraOptions?.center !== undefined) {
        // Set center and zoom to use for the selected lines
        this.linesCenter = cameraOptions.center;
        this.linesZoom = cameraOptions.zoom;

        // Set a decent zoom level that will be used to zoom into a specific station
        this.stationZoom = cameraOptions.zoom < 11 ? cameraOptions.zoom + 2 : cameraOptions.zoom + 1;

        console.log(this.linesZoom);

        // Adjust label zoom level if zoom is less than 11
        const labelZoomLevel = cameraOptions.zoom < 11 ? cameraOptions.zoom + 0.2 : cameraOptions.zoom;
        const allLayers = this.map.getStyle().layers;

        // Modify the label layer and update the zoom level
        if (allLayers) {
          allLayers.forEach((layer) => {
            if (layer.id.includes("labels")) {
              this.map.setLayerZoomRange(layer.id, labelZoomLevel, 24);
            }
          });
        }
      }
    }
  }

  // Fly back to the initial center and zoom
  public defaultView(): void {
    this.flyToCoords(this.initialCenter, this.initialZoom);
  }

  public flyToCoords(coordinates: LngLatLike, zoom: number): void {
    this.map.flyTo({
      center: coordinates,
      zoom: zoom,
    });
  }

  // Update the source with new GeoJSON data
  public updateGeoJSON(baseName: string, geoJSONData: FeatureCollection): void {
    const source = this.map.getSource(baseName);
    if (source) {
      (source as maplibregl.GeoJSONSource).setData(geoJSONData);
    }
  }

  public getLinesCenter(): LngLatLike {
    return this.linesCenter;
  }

  public getLinesZoom(): number {
    return this.linesZoom;
  }

  public getStationZoom(): number {
    return this.stationZoom;
  }
}

export default MapManager;
