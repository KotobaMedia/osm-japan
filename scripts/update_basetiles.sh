#!/bin/bash -e

OUT="$(realpath "${1:-./osm-japan-filtered.pmtiles}")"
cd "$(dirname "$0")"/..

echo "Output file: $OUT"

# See: https://maps.protomaps.com/builds/
# This script downloads the latest basetiles from Protomaps and extracts Japan
BUILD_URL="https://build-metadata.protomaps.dev/builds.json"

# Get the latest version of basetiles
LATEST_VERSION=$(curl -s "$BUILD_URL" | jq -r 'max_by(.key).key')
if [ -z "$LATEST_VERSION" ]; then
    echo "Failed to fetch the latest version of basetiles."
    exit 1
fi
echo "Latest version of basetiles: $LATEST_VERSION"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "latest_version=$LATEST_VERSION" >> "$GITHUB_OUTPUT"
fi

PMTILES_URL="https://build.protomaps.com/$LATEST_VERSION"

pmtiles extract "$PMTILES_URL" osm-japan.pmtiles --region "./data/japan-bbox.geojson" --download-threads=10 --overfetch=0.1

mvt-wrangler \
  osm-japan.pmtiles \
  "$OUT" \
  --filter ./data/osm-mvt-wrangler-filter.geojson \
  --name "KotobaMedia Basemap (Japan)" \
  --description "Basemap based on OpenStreetMap data, derived from Protomaps basemap tiles, filtered and adjusted for Japanese use."
