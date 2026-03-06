# osm-japan

KotobaMedia serves some basemap tiles based on [Protomaps' basemaps](https://github.com/protomaps/basemaps).
This repository manages the generation and styling of these base maps.

```bash
# Rebuild styles
pnpm build:styles
```

Styles for the generated tiles are in `styles/{lang}-{flavor}.json`. These are based on the [Protomaps](https://docs.protomaps.com/basemaps/flavors) default styles.

Fonts and icons are loaded from [KotobaMedia/basemaps-assets](https://github.com/KotobaMedia/basemaps-assets). Using `localIdeographFontFamily` is highly recommended, but not necessary, because the KotobaMedia fork includes Japanese glyphs.
