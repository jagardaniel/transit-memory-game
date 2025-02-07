#!/bin/bash

# Print the amount of stations (Points) in a GeoJSON file

if [ -z "$1" ]; then
  echo "Usage: $0 <geojson_file>"
  exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
  echo "Error: The file '$FILE' does not exist."
  exit 1
fi

if ! command -v /usr/bin/jq &> /dev/null; then
  echo "Error: jq is not installed."
  exit 1
fi

/usr/bin/jq '[.features[] | select(.geometry.type == "Point")] | length' "$FILE"
