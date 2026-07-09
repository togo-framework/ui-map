/**
 * Map component types for sentra-ui.
 *
 * The map renderer itself is NOT included in this package to avoid bundling
 * maplibre-gl (~600 KB gzipped WebGL runtime) as a hard dependency. Products
 * supply the renderer via the `renderMap` prop (see MapPanel). This keeps the
 * library tree-shaking-friendly: consumers that never show a map pay zero cost.
 */

// ─── Marker / GeoJSON types ──────────────────────────────────────────────────

/** A single geographic marker for the map. */
export interface MapMarker {
  id: string;
  /** Longitude */
  lng: number;
  /** Latitude */
  lat: number;
  /** Marker category — drives color + legend shape */
  markerType: MapMarkerType;
  /** English label shown in tooltip */
  label: string;
  /** Arabic label (RTL), falls back to label if absent */
  label_ar?: string;
  description?: string;
  description_ar?: string;
  /** Nominal size in pixels at zoom level 6 (data-driven) */
  size?: number;
}

/** All marker types the map legend and styling system understand. */
export type MapMarkerType =
  | 'strike'
  | 'launch_site'
  | 'proxy_force'
  | 'military_base'
  | 'air_defense'
  | 'nuclear'
  | 'naval'
  | 'infrastructure';

// ─── Legend types ─────────────────────────────────────────────────────────────

export type LegendShapeType =
  | 'diamond'
  | 'burst'
  | 'chevron'
  | 'triangle'
  | 'hexagon'
  | 'ring'
  | 'pill'
  | 'square';

export interface LegendItem {
  /** Marker type key — used to look up color and label */
  type: MapMarkerType;
  shape: LegendShapeType;
}

export interface LegendGroup {
  label: string;
  label_ar: string;
  items: LegendItem[];
}

// ─── Alert pin type ──────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface AlertMapItem {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string | null;
  severity: AlertSeverity | null;
  mode: string;
  scope: string;
  topics: string[];
  updated_at: string;
}

// ─── MapPanel props ──────────────────────────────────────────────────────────

/**
 * Region preset — used by the region selector and the fly-to handler.
 * The renderMap slot receives `initialRegion` so the product's map engine can
 * set its initial viewport.
 */
export interface MapRegionPreset {
  key: string;
  label: string;
  label_ar: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

/**
 * Layer toggle entry — sent to the LayersPanel and also passed to renderMap so
 * the product can show/hide GeoJSON layers.
 */
export interface MapLayer {
  id: string;
  label: string;
  label_ar: string;
  enabled: boolean;
  color?: string;
}

/**
 * The seam contract the renderMap prop must satisfy.
 *
 * The product supplies a renderer (e.g. <Map> from react-map-gl/maplibre) and
 * receives the full state it needs to wire GeoJSON Sources and Layers. The
 * sentra-ui package never imports react-map-gl or maplibre-gl.
 */
export interface RenderMapContext {
  /** Active layers; product hides/shows Source/Layer accordingly */
  layers: Record<string, boolean>;
  /** Markers to render as GeoJSON point features */
  markers: MapMarker[];
  /** Alert pins from the product's data fetch */
  alerts: AlertMapItem[];
  /** Currently active region preset */
  activeRegion: MapRegionPreset;
  /** Language code — 'en' | 'ar' */
  language: string;
  /** Text direction — 'ltr' | 'rtl' */
  dir: 'ltr' | 'rtl';
  /** Whether the host app is in dark theme */
  isDark: boolean;
}

export interface MapPanelProps {
  /**
   * The actual map renderer, supplied by the product.
   *
   * Receives full state via RenderMapContext. Return a React node that fills
   * its container (w-full h-full). Example usage in sentra-next:
   *
   * ```tsx
   * renderMap={(ctx) => (
   *   <SituationMapEmbed
   *     layers={ctx.layers}
   *     alerts={ctx.alerts}
   *     language={ctx.language}
   *     isDark={ctx.isDark}
   *   />
   * )}
   * ```
   *
   * If omitted, an informational placeholder is shown — useful in Storybook
   * and tests.
   */
  renderMap?: (ctx: RenderMapContext) => React.ReactNode;

  /** Markers passed to renderMap ctx — product builds these from its GeoJSON data */
  markers?: MapMarker[];

  /** Live alert pins — product fetches these from its bridge endpoint */
  alerts?: AlertMapItem[];

  /** Region presets for the region selector bar. Defaults to MENA presets. */
  regionPresets?: MapRegionPreset[];

  /** Layer definitions controlling the LayersPanel toggles */
  layers?: MapLayer[];

  /** Initial active region key — defaults to 'global' */
  initialRegion?: string;

  /** Active language code — 'en' | 'ar' */
  language?: string;

  /** Whether host is in dark theme — forwarded to renderMap ctx */
  isDark?: boolean;

  /** Called when a layer is toggled */
  onLayerToggle?: (layerId: string, enabled: boolean) => void;

  /** Called when alert count changes (useful for badge in host nav) */
  onAlertCountChange?: (count: number) => void;

  /** CSS class name applied to the root container */
  className?: string;
}
