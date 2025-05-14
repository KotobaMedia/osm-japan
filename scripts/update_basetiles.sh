#!/bin/bash -e

# This script downloads the latest basetiles from Protomaps and extracts Japan
BUILD_URL="https://build-metadata.protomaps.dev/builds.json"

# Get the latest version of basetiles
LATEST_VERSION=$(curl -s "$BUILD_URL" | jq -r 'max_by(.key).key')
if [ -z "$LATEST_VERSION" ]; then
    echo "Failed to fetch the latest version of basetiles."
    exit 1
fi
echo "Latest version of basetiles: $LATEST_VERSION"

PMTILES_URL="https://build.protomaps.com/$LATEST_VERSION"

pmtiles extract "$PMTILES_URL" osm-japan.pmtiles --region "./data/japan-bbox.geojson" --download-threads=10 --overfetch=0.1
