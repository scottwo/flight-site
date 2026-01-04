"use client";

import type { RouteLeg } from "@/lib/routes";
import { useEffect, useRef } from "react";

import Map from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style, Circle as CircleStyle, Text as TextStyle } from "ol/style";
import { isEmpty, extend as extendExtent } from "ol/extent";
import Overlay from "ol/Overlay";
import { unByKey } from "ol/Observable";
import type { EventsKey } from "ol/events";
import type { MapBrowserEvent } from "ol";

export default function FlightsMap({ routes }: { routes: RouteLeg[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<Map | null>(null);
  const routeSource = useRef(new VectorSource());
  const airportSource = useRef(new VectorSource());
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipOverlay = useRef<Overlay | null>(null);
  const hoverKey = useRef<EventsKey | EventsKey[] | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const osmSource = new OSM();

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: osmSource }),
        new VectorLayer({
          source: routeSource.current,
          style: (feature) =>
            new Style({
              stroke: new Stroke({
                color: "#1f4b71",
                width: 1 + (feature.get("count") ?? 1) * 0.8,
              }),
            }),
        }),
        new VectorLayer({
          source: airportSource.current,
          style: (feature) =>
            new Style({
              image: new CircleStyle({
                radius: 5,
                fill: new Fill({ color: "#0b1f33" }),
                stroke: new Stroke({ color: "#f3f7fc", width: 2 }),
              }),
              text: new TextStyle({
                text: feature.get("icao"),
                offsetY: -12,
                font: "600 12px sans-serif",
                fill: new Fill({ color: "#0b1f33" }),
                stroke: new Stroke({ color: "#eaf1f8", width: 3 }),
              }),
            }),
        }),
      ],
      view: new View({
        center: fromLonLat([-98, 39]),
        zoom: 3.5,
        minZoom: 2,
        maxZoom: 10,
      }),
    });

    mapObj.current = map;
    const tooltipEl = document.createElement("div");
    tooltipEl.className =
      "pointer-events-none rounded-md border border-[#b6c8dc] bg-white px-2 py-1 text-[11px] font-semibold text-[#0b1f33] shadow";
    tooltipRef.current = tooltipEl;
    const overlay = new Overlay({
      element: tooltipEl,
      offset: [10, 0],
      positioning: "center-left",
      stopEvent: false,
    });
    map.addOverlay(overlay);
    tooltipOverlay.current = overlay;

    map.updateSize();

    return () => {
      if (hoverKey.current) {
        unByKey(hoverKey.current);
      }
      if (tooltipOverlay.current) {
        map.removeOverlay(tooltipOverlay.current);
        tooltipOverlay.current = null;
      }
      map.setTarget(undefined);
      mapObj.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapObj.current;
    if (!map) return;

    const routeFeatures: Feature<LineString>[] = routes.map((route) => {
      const coords = [
        fromLonLat([route.from.lon, route.from.lat]),
        fromLonLat([route.to.lon, route.to.lat]),
      ];
      const feature = new Feature(new LineString(coords));
      feature.set("count", route.count);
      feature.set("label", `${route.from.icao} → ${route.to.icao}`);
      return feature;
    });

    const seen = new Set<string>();
    const airportFeatures: Feature<Point>[] = [];
    routes.forEach((route) => {
      [route.from, route.to].forEach((apt) => {
        if (seen.has(apt.icao)) return;
        seen.add(apt.icao);
        const feature = new Feature(new Point(fromLonLat([apt.lon, apt.lat])));
        feature.set("icao", apt.icao);
        airportFeatures.push(feature);
      });
    });

    routeSource.current.clear();
    airportSource.current.clear();
    routeSource.current.addFeatures(routeFeatures);
    airportSource.current.addFeatures(airportFeatures);

    const extent = routeSource.current.getExtent();
    const airportExtent = airportSource.current.getExtent();
    extendExtent(extent, airportExtent);
    if (!isEmpty(extent)) {
      map.getView().fit(extent, { padding: [40, 40, 40, 40], duration: 250 });
    }

    if (hoverKey.current) {
      unByKey(hoverKey.current);
    }

    hoverKey.current = map.on("pointermove", (evt) => {
      if (!tooltipOverlay.current || !tooltipRef.current) return;
      if (map.hasFeatureAtPixel(evt.pixel)) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f) as Feature | undefined;
        if (feature && feature.getGeometry() instanceof LineString) {
          const label = feature.get("label");
          const count = feature.get("count");
          tooltipRef.current.textContent = `${label} • ${count} flights`;
          tooltipOverlay.current.setPosition(evt.coordinate);
          tooltipRef.current.style.display = "block";
        } else {
          tooltipRef.current.style.display = "none";
        }
      } else {
        tooltipRef.current.style.display = "none";
      }
    });
  }, [routes]);

  return (
    <div className="rounded-2xl border border-[#d4e0ec] bg-white p-4 shadow-sm">
      <div
        ref={mapRef}
        className="relative h-[420px] w-full overflow-hidden rounded-xl bg-[#eaf1f8] pointer-events-auto"
        aria-label="Flight routes map"
      />
      <p className="mt-2 text-[11px] text-[#4b647c]">
        Tip: verify tile requests in Network tab (tile.openstreetmap.org) if the basemap is blank.
      </p>
    </div>
  );
}
