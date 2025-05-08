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
    const style = {
      version: 8,
      glyphs:'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
      sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
      sources: {
        "osm": {
          type: "vector",
          url: "https://tiles.kmproj.com/osm-japan.json",
          attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
        },
      },
      layers: layers("osm",namedFlavor(flavor),{lang})
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
