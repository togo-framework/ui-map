/**
 * Default configuration constants for the map components.
 *
 * These are the same values used in the source app (situation-map-data.ts /
 * MapLegend.tsx) extracted here so map components are self-contained without
 * depending on the app's data/ directory.
 */

import type { LegendGroup, MapMarkerType, MapRegionPreset, MapLayer } from './types';

// ─── Marker colors — matches MARKER_COLORS in situation-map-data.ts ──────────

export const MARKER_COLORS: Record<MapMarkerType, string> = {
  strike:         '#ef4444', // red-500
  launch_site:    '#f97316', // orange-500
  proxy_force:    '#a855f7', // purple-500
  military_base:  '#3b82f6', // blue-500
  air_defense:    '#06b6d4', // cyan-500
  nuclear:        '#eab308', // yellow-500
  naval:          '#14b8a6', // teal-500
  infrastructure: '#6b7280', // gray-500
};

// ─── Bilingual marker labels ──────────────────────────────────────────────────

export const MARKER_LABELS: Record<MapMarkerType, { en: string; ar: string }> = {
  strike:         { en: 'Strike / Attack',     ar: 'ضربة / هجوم' },
  launch_site:    { en: 'Launch Site',          ar: 'موقع الإطلاق' },
  proxy_force:    { en: 'Proxy Force',          ar: 'قوة وكيلة' },
  military_base:  { en: 'Military Base',        ar: 'قاعدة عسكرية' },
  air_defense:    { en: 'Air Defense',          ar: 'دفاع جوي' },
  nuclear:        { en: 'Nuclear Site',         ar: 'موقع نووي' },
  naval:          { en: 'Naval Chokepoint',     ar: 'نقطة خنق بحرية' },
  infrastructure: { en: 'Critical Infra.',      ar: 'بنية تحتية حرجة' },
};

// ─── Legend groups ────────────────────────────────────────────────────────────

export const DEFAULT_LEGEND_GROUPS: LegendGroup[] = [
  {
    label: 'Threats',
    label_ar: 'التهديدات',
    items: [
      { type: 'strike',      shape: 'diamond' },
      { type: 'launch_site', shape: 'burst' },
      { type: 'proxy_force', shape: 'chevron' },
    ],
  },
  {
    label: 'Assets',
    label_ar: 'الأصول',
    items: [
      { type: 'military_base', shape: 'triangle' },
      { type: 'air_defense',   shape: 'hexagon' },
      { type: 'nuclear',       shape: 'ring' },
    ],
  },
  {
    label: 'Infrastructure',
    label_ar: 'البنية التحتية',
    items: [
      { type: 'naval',          shape: 'pill' },
      { type: 'infrastructure', shape: 'square' },
    ],
  },
];

// ─── Default region presets — MENA-centric ───────────────────────────────────

export const DEFAULT_REGION_PRESETS: MapRegionPreset[] = [
  { key: 'global', label: 'Global',   label_ar: 'عالمي',           latitude: 25.3, longitude: 51.5, zoom: 2.8 },
  { key: 'mena',   label: 'MENA',     label_ar: 'الشرق الأوسط',    latitude: 28,   longitude: 45,   zoom: 3.5 },
  { key: 'gulf',   label: 'Gulf',     label_ar: 'الخليج',           latitude: 26,   longitude: 52,   zoom: 5.5 },
  { key: 'levant', label: 'Levant',   label_ar: 'المشرق',           latitude: 33,   longitude: 36,   zoom: 5.5 },
  { key: 'iran',   label: 'Iran',     label_ar: 'إيران',             latitude: 32.5, longitude: 53,   zoom: 5 },
  { key: 'redSea', label: 'Red Sea',  label_ar: 'البحر الأحمر',     latitude: 18,   longitude: 42,   zoom: 4.5 },
];

// ─── Default layer definitions ────────────────────────────────────────────────

export const DEFAULT_LAYERS: MapLayer[] = [
  { id: 'iranStrikes',      label: 'Iran Strikes',        label_ar: 'ضربات إيران',         enabled: true,  color: MARKER_COLORS.strike },
  { id: 'usBases',          label: 'US Bases',            label_ar: 'القواعد الأمريكية',    enabled: true,  color: MARKER_COLORS.military_base },
  { id: 'iranianProxies',   label: 'Iranian Proxies',     label_ar: 'الوكلاء الإيرانيون',   enabled: true,  color: MARKER_COLORS.proxy_force },
  { id: 'nuclearSites',     label: 'Nuclear Sites',       label_ar: 'المواقع النووية',      enabled: true,  color: MARKER_COLORS.nuclear },
  { id: 'airDefense',       label: 'Air Defense',         label_ar: 'الدفاع الجوي',         enabled: false, color: MARKER_COLORS.air_defense },
  { id: 'navalChokepoints', label: 'Naval Chokepoints',   label_ar: 'نقاط الخنق البحرية',   enabled: false, color: MARKER_COLORS.naval },
  { id: 'criticalInfra',    label: 'Critical Infra.',     label_ar: 'البنية التحتية الحرجة', enabled: false, color: MARKER_COLORS.infrastructure },
  { id: 'conflictZones',    label: 'Conflict Zones',      label_ar: 'مناطق النزاع',          enabled: true,  color: '#dc2626' },
];
