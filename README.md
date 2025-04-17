# osm-japan

KotobaMedia serves some basemap tiles based on Protomaps' builds.
This repository manages the generation and styling of these base maps.

```bash
# Update a local copy of `osm-japan.pmtiles` based on the most recent Protomaps build
# Creates a Japan extract based on Geofabrik's Japan extent -- see data/geofabrik-japan.geojson for more
./scripts/update_basetiles.sh

# Upload the local `osm-japan.pmtiles` to the tileserver
./scripts/upload.sh

# Rebuild styles
pnpm build:styles
```

Styles for the generated tiles are in `styles/{lang}-{flavor}.json`. These are based on the [Protomaps](https://docs.protomaps.com/basemaps/flavors)
default styles.
