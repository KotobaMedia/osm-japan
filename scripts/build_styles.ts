import { layers, namedFlavor } from '@protomaps/basemaps';
import { writeFileSync, readdirSync } from 'node:fs';

const languages = [
  "ja",
  "en",
];
const flavors = [
  "light",
  "dark",
  "white",
  "black",
  "grayscale",
];

for (const lang of languages) {
  for (const flavor of flavors) {
    const styleLayers = layers("osm",namedFlavor(flavor),{lang})
      .map((layer) => {
        if (layer.id === "boundaries_country") {
          layer.filter = [
            "all",
            ["<=", "kind_detail", 2],
            ["!=", "disputed", true]
          ];
        }
        return layer;
      });
    const waterLayerIdx = styleLayers.findIndex(l => l.id === 'water');
    styleLayers.splice(waterLayerIdx, 0, {
      id: "hillshade",
      type: "hillshade",
      source: "dem",
      paint: {
        'hillshade-method': 'standard',
        'hillshade-exaggeration': [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0.4,
          6,
          0.2,
          10,
          0.1,
          15,
          0.05
        ],
      }
    });
    const style = {
      version: 8,
      glyphs:'https://kotobamedia.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
      sprite: `https://kotobamedia.github.io/basemaps-assets/sprites/v4/${flavor}`,
      sources: {
        "osm": {
          type: "vector",
          url: "https://tiles.km-cdn.net/osm-japan",
          attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
        },
        "dem": {
          type: "raster-dem",
          url: "https://tiles.km-cdn.net/aist_gsj_dem_jpland_trgb",
          minzoom: 0,
          maxzoom: 14,
          tileSize: 256,
        }
      },
      layers: styleLayers,
    };
    const styleName = `osm-${lang}-${flavor}`;
    writeFileSync(`./styles/${styleName}.json`, JSON.stringify(style, null, 2));
  }
}

// Build styles array by reading directory contents
const styles = readdirSync('./styles')
  .filter(file => file !== 'styles.json')
  .map(file => file.replace('.json', ''));

writeFileSync(
  "./styles/styles.json",
  JSON.stringify(styles, null, 2),
);
