import { layers, namedFlavor } from '@protomaps/basemaps';
import { writeFileSync, readdirSync } from 'node:fs';

type StyleLayer = Record<string, any>;
type RoadContext = "surface" | "tunnel" | "bridge";

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

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const buildMotorwayFilter = (context: RoadContext, isLink: boolean): unknown[] => {
  const filter: unknown[] = ["all"];
  if (context === "surface") {
    filter.push(["!has", "is_tunnel"], ["!has", "is_bridge"]);
  } else if (context === "tunnel") {
    filter.push(["has", "is_tunnel"]);
  } else {
    filter.push(["has", "is_bridge"]);
  }
  filter.push(["==", "kind", "highway"]);
  filter.push(["==", "kind_detail", isLink ? "motorway_link" : "motorway"]);
  filter.push(isLink ? ["has", "is_link"] : ["!has", "is_link"]);
  return filter;
};

const insertDerivedRoadLayer = (
  styleLayers: StyleLayer[],
  sourceId: string,
  id: string,
  color: string,
  filter: unknown[]
): boolean => {
  if (styleLayers.some((layer) => layer.id === id)) {
    return true;
  }
  const sourceIdx = styleLayers.findIndex((layer) => layer.id === sourceId);
  if (sourceIdx === -1) {
    return false;
  }
  const derivedLayer = deepClone(styleLayers[sourceIdx]);
  derivedLayer.id = id;
  derivedLayer.filter = filter;
  derivedLayer.paint = {
    ...derivedLayer.paint,
    "line-color": color
  };
  styleLayers.splice(sourceIdx + 1, 0, derivedLayer);
  return true;
};

for (const lang of languages) {
  for (const flavor of flavors) {
    const styleLayers: StyleLayer[] = layers("osm",namedFlavor(flavor),{lang})
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
    const isDark = flavor === "dark";
    const shouldPatchRails = flavor === "light" || flavor === "dark";
    if (shouldPatchRails) {
      const nameField = `name:${lang}`;
      const railGenericColor = isDark ? "#5f5f5f" : "#6f6f6f";
      const railFillColor = isDark ? "#767676" : "#8a8a8a";
      const railBgColor = isDark ? "#e0e0e0" : "#ffffff";
      const shinkansenColor = isDark ? "#1976d2" : "#1e88e5";
      const railLabelTextColor = isDark ? "#7a7a7a" : "#4a4a4a";
      const railLabelHaloColor = isDark ? "#212121" : "#ffffff";
      const widthExpr = (minWidth: number, maxWidth: number) => [
        "interpolate",
        ["exponential", 1.6],
        ["zoom"],
        6,
        minWidth,
        18,
        maxWidth
      ];
      const railFilter = (...conditions: unknown[]) => [
        "all",
        ["==", "kind", "rail"],
        ["in", "kind_detail", "rail", "subway"],
        ...conditions
      ];
      const nonServiceFilter = ["!has", "service"];
      const serviceFilter = ["has", "service"];
      const jrFilter = ["==", "is_jr", true];
      const genericFilter = [
        "any",
        ["!has", "is_jr"],
        ["==", "is_jr", false]
      ];
      const nonHighspeedFilter = [
        "any",
        ["!has", "highspeed"],
        ["!=", "highspeed", "yes"]
      ];
      const shinkansenFilter = ["==", "highspeed", "yes"];
      const jrRailLayout = {
        "line-cap": "butt",
        "line-join": "round"
      };
      const railLayers = [
        {
          id: "roads_rail_generic",
          type: "line",
          source: "osm",
          "source-layer": "roads",
          filter: railFilter(nonServiceFilter, genericFilter),
          paint: {
            "line-color": railGenericColor,
            "line-width": widthExpr(0.3, 10)
          }
        },
        {
          id: "roads_rail_generic_service",
          type: "line",
          source: "osm",
          "source-layer": "roads",
          minzoom: 14,
          filter: railFilter(serviceFilter, genericFilter),
          paint: {
            "line-color": railGenericColor,
            "line-width": widthExpr(0.3, 4.5)
          }
        },
        {
          id: "roads_rail_jr_casing",
          type: "line",
          source: "osm",
          "source-layer": "roads",
          filter: railFilter(nonServiceFilter, jrFilter, nonHighspeedFilter),
          paint: {
            "line-color": railFillColor,
            "line-width": widthExpr(1.5, 13)
          },
          layout: {
            ...jrRailLayout,
            visibility: "visible"
          }
        },
        {
          id: "roads_rail_jr_bg",
          type: "line",
          source: "osm",
          "source-layer": "roads",
          filter: railFilter(nonServiceFilter, jrFilter, nonHighspeedFilter),
          paint: {
            "line-color": railBgColor,
            "line-width": widthExpr(1, 9)
          },
          layout: {
            ...jrRailLayout,
            visibility: "visible"
          }
        },
        {
          id: "roads_rail_jr",
          type: "line",
          source: "osm",
          "source-layer": "roads",
          filter: railFilter(nonServiceFilter, jrFilter, nonHighspeedFilter),
          paint: {
            "line-dasharray": ["literal", [5, 5]],
            "line-color": railFillColor,
            "line-width": widthExpr(1.5, 13)
          },
          layout: {
            ...jrRailLayout
          }
        },
        {
          id: "roads_rail_jr_shinkansen_casing",
          type: "line",
          source: "osm",
          "source-layer": "roads",
          filter: railFilter(nonServiceFilter, jrFilter, shinkansenFilter),
          paint: {
            "line-color": shinkansenColor,
            "line-width": widthExpr(1.5, 13)
          },
          layout: {
            ...jrRailLayout,
            visibility: "visible"
          }
        },
        {
          id: "roads_rail_jr_shinkansen_bg",
          type: "line",
          source: "osm",
          "source-layer": "roads",
          filter: railFilter(nonServiceFilter, jrFilter, shinkansenFilter),
          paint: {
            "line-color": railBgColor,
            "line-width": widthExpr(1, 9)
          },
          layout: {
            ...jrRailLayout,
            visibility: "visible"
          }
        },
        {
          id: "roads_rail_jr_shinkansen",
          type: "line",
          source: "osm",
          "source-layer": "roads",
          filter: railFilter(nonServiceFilter, jrFilter, shinkansenFilter),
          paint: {
            "line-dasharray": ["literal", [8, 8]],
            "line-color": shinkansenColor,
            "line-width": widthExpr(1.5, 13)
          },
          layout: {
            ...jrRailLayout
          }
        },
      ];
      const railLayerIdx = styleLayers.findIndex((layer) => layer.id === "roads_rail");
      if (railLayerIdx !== -1) {
        styleLayers.splice(railLayerIdx, 1, ...railLayers);
      }
      const railLabelLayerIdx = styleLayers.findIndex((layer) => layer.id === "roads_labels_major");
      if (railLabelLayerIdx !== -1 && !styleLayers.some((layer) => layer.id === "roads_labels_rail")) {
        styleLayers.splice(railLabelLayerIdx, 0, {
          id: "roads_labels_rail",
          type: "symbol",
          source: "osm",
          "source-layer": "roads",
          minzoom: 11,
          filter: [
            "all",
            ["==", "kind", "rail"],
            ["==", "kind_detail", "rail"],
            ["!has", "service"],
            [
              "any",
              ["has", nameField],
              ["has", "name"]
            ]
          ],
          layout: {
            "symbol-placement": "line",
            "text-font": ["Noto Sans Regular"],
            "text-field": [
              "coalesce",
              ["get", nameField],
              ["get", "name"]
            ],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11,
              10,
              14,
              12,
              18,
              14
            ],
            "text-letter-spacing": 0.1
          },
        paint: {
          "text-color": railLabelTextColor,
          "text-halo-color": railLabelHaloColor,
          "text-halo-width": 1
        }
        });
      }
    }
    const shouldPatchMotorways = flavor === "light" || flavor === "dark";
    if (shouldPatchMotorways) {
      const motorwayColors = isDark
        ? {
          surface: "#4DD98F",
          surfaceCasing: "#29AD69",
          tunnel: "#7CE8B1",
          tunnelCasing: "#60DA9C"
        }
        : {
          surface: "#3CC878",
          surfaceCasing: "#1f8f55",
          tunnel: "#77d9a1",
          tunnelCasing: "#60d08e"
        };
      const motorwayLayerSpecs: Array<{
        sourceId: string;
        id: string;
        context: RoadContext;
        isLink: boolean;
        color: string;
      }> = [
          {
            sourceId: "roads_tunnels_link_casing",
            id: "roads_tunnels_motorway_link_casing",
            context: "tunnel",
            isLink: true,
            color: motorwayColors.tunnelCasing
          },
          {
            sourceId: "roads_tunnels_highway_casing",
            id: "roads_tunnels_motorway_casing",
            context: "tunnel",
            isLink: false,
            color: motorwayColors.tunnelCasing
          },
          {
            sourceId: "roads_tunnels_link",
            id: "roads_tunnels_motorway_link",
            context: "tunnel",
            isLink: true,
            color: motorwayColors.tunnel
          },
          {
            sourceId: "roads_tunnels_highway",
            id: "roads_tunnels_motorway",
            context: "tunnel",
            isLink: false,
            color: motorwayColors.tunnel
          },
          {
            sourceId: "roads_link_casing",
            id: "roads_motorway_link_casing",
            context: "surface",
            isLink: true,
            color: motorwayColors.surfaceCasing
          },
          {
            sourceId: "roads_highway_casing_early",
            id: "roads_motorway_casing",
            context: "surface",
            isLink: false,
            color: motorwayColors.surfaceCasing
          },
          {
            sourceId: "roads_link",
            id: "roads_motorway_link",
            context: "surface",
            isLink: true,
            color: motorwayColors.surface
          },
          {
            sourceId: "roads_highway",
            id: "roads_motorway",
            context: "surface",
            isLink: false,
            color: motorwayColors.surface
          },
          {
            sourceId: "roads_bridges_link_casing",
            id: "roads_bridges_motorway_link_casing",
            context: "bridge",
            isLink: true,
            color: motorwayColors.surfaceCasing
          },
          {
            sourceId: "roads_bridges_highway_casing",
            id: "roads_bridges_motorway_casing",
            context: "bridge",
            isLink: false,
            color: motorwayColors.surfaceCasing
          },
          {
            sourceId: "roads_bridges_link",
            id: "roads_bridges_motorway_link",
            context: "bridge",
            isLink: true,
            color: motorwayColors.surface
          },
          {
            sourceId: "roads_bridges_highway",
            id: "roads_bridges_motorway",
            context: "bridge",
            isLink: false,
            color: motorwayColors.surface
          }
        ];
      const missingSourceIds: string[] = [];
      for (const spec of motorwayLayerSpecs) {
        const inserted = insertDerivedRoadLayer(
          styleLayers,
          spec.sourceId,
          spec.id,
          spec.color,
          buildMotorwayFilter(spec.context, spec.isLink)
        );
        if (!inserted) {
          missingSourceIds.push(spec.sourceId);
        }
      }
      if (missingSourceIds.length > 0) {
        const uniqueMissingSourceIds = [...new Set(missingSourceIds)];
        throw new Error(
          `Missing expected road layer(s) for motorway patch: ${uniqueMissingSourceIds.join(", ")}`
        );
      }
    }
    const poiLayerIdx = styleLayers.findIndex((layer) => layer.id === "pois");
    if (poiLayerIdx !== -1 && !styleLayers.some((layer) => layer.id === "pois_station")) {
      const poiLayer = styleLayers[poiLayerIdx];
      const stationLayer = JSON.parse(JSON.stringify(poiLayer));
      stationLayer.id = "pois_station";
      const poiFilter = poiLayer.filter;
      const poiConditions = Array.isArray(poiFilter) && poiFilter[0] === "all"
        ? poiFilter.slice(1)
        : (poiFilter ? [poiFilter] : []);
      const stationConditions = poiConditions.filter((condition) => {
        return !(
          Array.isArray(condition) &&
          condition[0] === "in" &&
          Array.isArray(condition[1]) &&
          condition[1][0] === "get" &&
          condition[1][1] === "kind"
        );
      });
      stationLayer.filter = [
        "all",
        ["==", ["get", "kind"], ["literal", "station"]],
        ...stationConditions
      ];
      for (const condition of poiConditions) {
        if (
          Array.isArray(condition) &&
          condition[0] === "in" &&
          Array.isArray(condition[1]) &&
          condition[1][0] === "get" &&
          condition[1][1] === "kind" &&
          Array.isArray(condition[2]) &&
          condition[2][0] === "literal" &&
          Array.isArray(condition[2][1])
        ) {
          condition[2][1] = condition[2][1].filter((value) => value !== "station");
        }
      }
      let lastPlacesIdx = -1;
      for (let i = 0; i < styleLayers.length; i += 1) {
        const layerId = styleLayers[i]?.id;
        if (typeof layerId === "string" && layerId.startsWith("places_")) {
          lastPlacesIdx = i;
        }
      }
      const insertIdx = lastPlacesIdx !== -1 ? lastPlacesIdx + 1 : poiLayerIdx + 1;
      styleLayers.splice(insertIdx, 0, stationLayer);
    }
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
      glyphs: 'https://kotobamedia.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
      sprite: `https://kotobamedia.github.io/basemaps-assets/sprites/v4/${flavor}`,
      sources: {
        "osm": {
          type: "vector",
          url: "https://tiles.kmproj.com/osm-japan.json",
          attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
        },
        "dem": {
          type: "raster-dem",
          attribution: "<a href=\"https://tiles.kmproj.com/attribution\">Attribution</a>",
          tiles: ["https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"],
          encoding: "terrarium",
          minzoom: 0,
          maxzoom: 14,
          tileSize: 512,
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
