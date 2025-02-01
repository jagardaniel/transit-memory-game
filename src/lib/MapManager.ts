import maplibregl, { LngLatBounds, type LngLatLike } from "maplibre-gl";
import type { FeatureCollection } from "geojson";

class MapManager {
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
      center: this.initialCenter, // Default to Stockholm
      zoom: this.initialZoom,
      maxZoom: 15,
    });

    // Disable map rotation
    this.map.dragRotate.disable();
    this.map.keyboard.disable();
    this.map.touchZoomRotate.disableRotation();

    // Emit event when the user stops dragging the map
    this.map.on("dragend", () => {
      const event = new CustomEvent("mapDragEnd");
      window.dispatchEvent(event);
    });
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

  // Create a bounding box with all the GeoJSON points and then fly to it
  public fitView(geoJSONData: FeatureCollection[]): void {
    let overallBounds: LngLatBounds | null = null;

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
      this.map.fitBounds(overallBounds, { padding: 30, maxZoom: 13 });
    }
  }

  // Fly back to the initial center and zoom
  public defaultView(): void {
    this.map.flyTo({
      center: this.initialCenter,
      zoom: this.initialZoom,
    });
  }

  public flyToCoords(coordinates: LngLatLike): void {
    this.map.flyTo({
      center: coordinates,
      zoom: 12.5,
    });
  }

  // Update the source with new GeoJSON data
  public updateGeoJSON(baseName: string, geoJSONData: FeatureCollection): void {
    const source = this.map.getSource(baseName);
    if (source) {
      (source as maplibregl.GeoJSONSource).setData(geoJSONData);
    }
  }
}

export default MapManager;
