"use client";

import * as React from "react";
import { cn } from "@togo-framework/ui-core";

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  /** Marker color (defaults to the brand primary). */
  color?: string;
}

export interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  /** Height of the map container (CSS value). Default 360px. */
  height?: number | string;
  className?: string;
  /** Tile attribution. Defaults to OpenStreetMap. */
  attribution?: string;
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

function ensureLeafletCss() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[data-togo-leaflet]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = LEAFLET_CSS;
  link.setAttribute("data-togo-leaflet", "");
  document.head.appendChild(link);
}

/** MapView — a real OpenStreetMap powered by leaflet. SSR-safe (leaflet loads in an
 * effect, client-only). Pass `center`, `zoom`, and `markers`. Themed container; the
 * tiles are OSM raster. */
export function MapView({
  center, zoom = 12, markers = [], height = 360, className,
  attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}: MapViewProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<any>(null);
  const layerRef = React.useRef<any>(null);

  React.useEffect(() => {
    let cancelled = false;
    ensureLeafletCss();
    (async () => {
      const L = (await import("leaflet")).default ?? (await import("leaflet"));
      if (cancelled || !ref.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, { attributionControl: true }).setView(center, zoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution, maxZoom: 19,
        }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      } else {
        mapRef.current.setView(center, zoom);
      }
      // markers
      layerRef.current.clearLayers();
      for (const m of markers) {
        const color = m.color ?? "hsl(345 75% 33%)";
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const mk = L.marker([m.lat, m.lng], { icon }).addTo(layerRef.current);
        if (m.label) mk.bindPopup(m.label);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom, JSON.stringify(markers)]);

  React.useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden rounded-xl border border-border bg-muted", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
    />
  );
}
