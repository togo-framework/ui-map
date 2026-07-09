// Map component barrel — import from '@prism/ui' (via the root index) or
// from '@prism/ui/components/map' directly.

export { MapLegend } from './MapLegend';
export type { MapLegendProps } from './MapLegend';

export { MapLayersPanel } from './MapLayersPanel';
export type { MapLayersPanelProps } from './MapLayersPanel';

export { MapPanel } from './MapPanel';
export type { MapPanelProps } from './types';

export { EventMapPanel } from './EventMapPanel';
export type { EventMapPanelProps } from './EventMapPanel';

// Types
export type {
  MapMarker,
  MapMarkerType,
  LegendShapeType,
  LegendItem,
  LegendGroup,
  AlertSeverity,
  AlertMapItem,
  MapRegionPreset,
  MapLayer,
  RenderMapContext,
} from './types';

// Defaults (useful for product customisation)
export {
  MARKER_COLORS,
  MARKER_LABELS,
  DEFAULT_LEGEND_GROUPS,
  DEFAULT_REGION_PRESETS,
  DEFAULT_LAYERS,
} from './mapDefaults';
