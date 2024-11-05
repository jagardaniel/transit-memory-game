import os
import json
import argparse

from pathlib import Path

# A script that removes data that we don't need from the exported GeoJSON object.
# Since the data will be static it is probably better to do it here than
# during runtime. Also add a property so we can keep track on guessed stations
# and do some name replacement.

OUT_DIR = "out/"

name_replacements = {
    "Sankt Eriksplan": "S:t Eriksplan"
}

def process_geojson(file_path):
    Path(OUT_DIR).mkdir(exist_ok=True)

    with open(file_path) as file:
        data = json.load(file)

    if data.get("type") != "FeatureCollection" or "features" not in data:
        print("Invalid GeoJSON format.")
        return None

    unique_names = set()
    new_features = []

    for feature in data["features"]:
        geometry_type = feature["geometry"]["type"]

        # If the type is a Point, remove all properties except the name.
        # Also add a property so we can mark a "station" (Point) as guessed.
        if geometry_type == "Point":
            name = feature["properties"].get("name", None)

            if name in name_replacements:
                name = name_replacements[name]

            if name and name not in unique_names:
                unique_names.add(name)
                feature["properties"] = {
                    "name": name,
                    "guessed": False
                }
                new_features.append(feature)

        # Remove all properties for MultiLineString type
        elif geometry_type == "MultiLineString":
            feature["properties"] = {}

            new_features.append(feature)

    data["features"] = new_features

    # Saved the modified GeoJSON data
    output_file = os.path.basename(file_path)
    output_path = os.path.join(OUT_DIR, output_file)
    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4, ensure_ascii=False)

    print(f"Processed GeoJSON saved to: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a GeoJSON file.")
    parser.add_argument("file_path", type=str, help="Path to the GeoJSON file to be processed")

    args = parser.parse_args()
    process_geojson(args.file_path)
