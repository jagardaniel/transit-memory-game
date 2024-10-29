export async function loadGeoJSON(linePath: string): Promise<any> {
  const geoJSONPath = `geojson/${linePath}`;

  try {
    const response = await fetch(geoJSONPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading GeoJSON from ${geoJSONPath}:`, error);
    throw error;
  }
}
