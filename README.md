# osm-japan

KotobaMedia serves some basemap tiles based on Protomaps' daily builds.
This repository manages the generation and styling of these base maps.

[mvt-wrangler](https://github.com/KotobaMedia/mvt-wrangler/) is used to perform filtering on the
tileset from Protomaps.

```bash
# Update a local copy of `osm-japan.pmtiles` based on the most recent Protomaps build
# Creates a Japan extract -- see data/japan-bbox.geojson for more
# Then, it filters the data using mvt-wrangler -- see data/osm-mvt-wrangler-filter.geojson for the specifics.
./scripts/update_basetiles.sh

# Upload the local `osm-japan.pmtiles` to the tileserver
./scripts/upload.sh

# Rebuild styles
pnpm build:styles
```

Styles for the generated tiles are in `styles/{lang}-{flavor}.json`. These are based on the [Protomaps](https://docs.protomaps.com/basemaps/flavors) default styles.
