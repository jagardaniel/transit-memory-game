import maplibregl, { LngLatBounds, type LngLatLike } from "maplibre-gl";
import type { FeatureCollection } from "geojson";

export class MapManager {
  private map: maplibregl.Map;

  private initialZoom: number;
  private initialCenter: LngLatLike;

  constructor(container: HTMLDivElement) {
    this.initialCenter = [18.071136585570766, 59.32743910768781]; // Default to Stockholm
    this.initialZoom = 7;

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

  public initialView(): void {
    this.flyToCoords(this.initialCenter, this.initialZoom);
  }

  public drawGeoJSON(baseName: string, lineColor: string, markersMinZoom: number, geoJSONData: FeatureCollection): void {
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

    // Set a minimum zoom level for the station markers. Based on how much "area" the lines covers.
    // Definitely not perfect right now, should be adjusted in the future.

    // Disabled for now, not sure if even needed
    let minZoom = 10;

    const bounds = this.getBounds(geoJSONData);
    if (bounds) {
      const cameraOptions = this.getCameraForBounds(bounds);
      if (cameraOptions) {
        minZoom = cameraOptions.zoom < 11 ? cameraOptions.zoom + 0.1 : cameraOptions.zoom;
      }
    }

    // Draw text labels for stations. Only visible if guessed property is set to true
    this.map.addLayer({
      id: baseName + "-labels",
      type: "symbol",
      source: baseName,
      layout: {
        "text-field": ["get", "name"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          9, // At zoom level 10, text size is 9
          11,
          10, // At zoom level 11, text size is 10
          12,
          11, // At zoom level 12, text size is 11
        ],
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
      minzoom: markersMinZoom,
    });
  }

  // Use the fly effect to zoom into coordinates with a specific zoom level
  public flyToCoords(coordinates: LngLatLike, zoom: number): void {
    this.map.flyTo({
      center: coordinates,
      zoom: zoom,
      essential: true,
    });
  }

  // Update the source with new GeoJSON data
  public updateGeoJSON(baseName: string, geoJSONData: FeatureCollection): void {
    const source = this.map.getSource(baseName);
    if (source) {
      (source as maplibregl.GeoJSONSource).setData(geoJSONData);
    }
  }

  // Create a bounding box based on the Point coordinates from the GeoJSON data
  public getBounds(geoJSONData: FeatureCollection): LngLatBounds | null {
    const bounds = new maplibregl.LngLatBounds();
    let hasPoints = false;

    geoJSONData.features.forEach((feature) => {
      if (feature.geometry.type === "Point") {
        bounds.extend(feature.geometry.coordinates as [number, number]);
        hasPoints = true;
      }
    });

    return hasPoints ? bounds : null;
  }

  // Merge multiple bounding boxes from GeoJSON data
  public getMergedBounds(featureCollections: FeatureCollection[]): LngLatBounds | null {
    const overallBounds = new maplibregl.LngLatBounds();
    let hasValidBounds = false;

    featureCollections.forEach((geoJSONData) => {
      const bounds = this.getBounds(geoJSONData);
      if (bounds) {
        overallBounds.extend(bounds.getSouthWest());
        overallBounds.extend(bounds.getNorthEast());
        hasValidBounds = true;
      }
    });

    return hasValidBounds ? overallBounds : null;
  }

  // Get the desired center and zoom level for a bounding box
  public getCameraForBounds(bounds: LngLatBounds): { center: LngLatLike; zoom: number } | null {
    const cameraOptions = this.map.cameraForBounds(bounds, {
      padding: 30,
      maxZoom: 13,
    });

    if (!cameraOptions?.center || cameraOptions.zoom === undefined) return null;

    return {
      center: cameraOptions.center,
      zoom: cameraOptions.zoom,
    };
  }

  public getStationZoomForBounds(bounds: LngLatBounds): number | null {
    const cameraOptions = this.getCameraForBounds(bounds);
    if (!cameraOptions) return null;

    return cameraOptions.zoom < 11 ? cameraOptions.zoom + 2 : cameraOptions.zoom + 1;
  }
}
