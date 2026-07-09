'use client'

/**
 * MapPanel — chrome shell for the situation map view.
 *
 * Ported from app/src/components/situation-map/SituationMapEmbed.tsx.
 *
 * DESIGN DECISION — renderMap seam (option b from the porting spec):
 * ──────────────────────────────────────────────────────────────────
 * react-map-gl@7 + maplibre-gl@4 together add ~600 KB gzipped WebGL runtime.
 * Bundling them into @prism/ui would force every product consumer to pay that
 * cost even when no map is rendered (e.g. Scout's data-table views).
 *
 * Instead, MapPanel exposes a `renderMap` prop that receives a RenderMapContext
 * object. The product (sentra-next) supplies the actual <Map> component from
 * react-map-gl/maplibre, which it already depends on. sentra-ui ships zero
 * map-library bytes.
 *
 * Everything else — region selector bar, time-range filter, layers panel,
 * legend, alert sidebar — is real and fully ported here. The seam is only
 * the WebGL canvas itself.
 *
 * Adaptations from source:
 * - @/lib/utils        → ../../lib/utils
 * - @/components/ui/*  → ../ui/*
 * - useLanguage        → language / dir props
 * - useTheme           → isDark prop
 * - bridge + useQuery  → alerts prop (product fetches and passes)
 * - WebSocket listener → onAlertCountChange callback
 * - REGION_PRESETS     → regionPresets prop (defaults to DEFAULT_REGION_PRESETS)
 * - LayersPanel / MapLegend → imported from this module
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@togo-framework/ui-core';
import { MapLegend } from './MapLegend';
import { MapLayersPanel } from './MapLayersPanel';
import type {
  MapPanelProps,
  MapRegionPreset,
  RenderMapContext,
  AlertMapItem,
  AlertSeverity,
} from './types';
import { DEFAULT_REGION_PRESETS, DEFAULT_LAYERS } from './mapDefaults';

// ─── Severity color map ───────────────────────────────────────────────────────

const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: '#dc2626',
  high:     '#ea580c',
  medium:   '#d97706',
  low:      '#16a34a',
};

// ─── Time range config ────────────────────────────────────────────────────────

const TIME_RANGES = [
  { key: '24h', ms: 86_400_000,      label_en: '24h',  label_ar: '24 س' },
  { key: '7d',  ms: 7 * 86_400_000,  label_en: '7d',   label_ar: '7 أيام' },
  { key: '30d', ms: 30 * 86_400_000, label_en: '30d',  label_ar: '30 يوم' },
  { key: 'all', ms: Infinity,         label_en: 'All',  label_ar: 'الكل' },
] as const;

type TimeRangeKey = '24h' | '7d' | '30d' | 'all';

// ─── Map placeholder (shown when renderMap is not provided) ──────────────────

const MapPlaceholder = ({ isDark }: { isDark: boolean }) => (
  <div
    className={cn(
      'w-full h-full flex flex-col items-center justify-center gap-3',
      isDark ? 'bg-[hsl(var(--sr-navy-deep))]' : 'bg-muted',
    )}
    role="img"
    aria-label="Map placeholder — supply renderMap prop to render the actual map"
  >
    {/* Stylised grid suggesting a map */}
    <svg
      width="80"
      height="60"
      viewBox="0 0 80 60"
      fill="none"
      aria-hidden="true"
      className="opacity-30"
    >
      <rect width="80" height="60" rx="4" fill={isDark ? '#1e293b' : '#cbd5e1'} />
      {/* Horizontal grid lines */}
      {[10, 20, 30, 40, 50].map(y => (
        <line key={y} x1="0" y1={y} x2="80" y2={y} stroke={isDark ? '#334155' : '#94a3b8'} strokeWidth="0.5" />
      ))}
      {/* Vertical grid lines */}
      {[16, 32, 48, 64].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="60" stroke={isDark ? '#334155' : '#94a3b8'} strokeWidth="0.5" />
      ))}
      {/* Fake "landmass" blob */}
      <ellipse cx="40" cy="30" rx="22" ry="14" fill={isDark ? '#1e3a5f' : '#bfdbfe'} opacity="0.6" />
      {/* Sample marker dots */}
      <circle cx="35" cy="26" r="3" fill="#ef4444" />
      <circle cx="48" cy="33" r="2.5" fill="#f97316" />
      <circle cx="28" cy="34" r="2" fill="#3b82f6" />
    </svg>
    <p className="text-[11px] text-muted-foreground text-center px-4 max-w-[200px]">
      Supply a <code className="font-mono text-[10px]">renderMap</code> prop to
      render the map engine.
    </p>
  </div>
);
MapPlaceholder.displayName = 'MapPlaceholder';

// ─── Component ────────────────────────────────────────────────────────────────

export const MapPanel = ({
  renderMap,
  markers = [],
  alerts = [],
  regionPresets = DEFAULT_REGION_PRESETS,
  layers: layersProp,
  initialRegion = 'global',
  language = 'en',
  isDark = true,
  onLayerToggle,
  onAlertCountChange,
  className,
}: MapPanelProps) => {
  const isAr = language === 'ar';

  // ── Region selector ──────────────────────────────────────────────────────
  const [activeRegionKey, setActiveRegionKey] = useState(initialRegion);

  const handleRegionSelect = useCallback((key: string) => {
    setActiveRegionKey(key);
  }, []);

  const activeRegion: MapRegionPreset = useMemo(
    () =>
      regionPresets.find(r => r.key === activeRegionKey) ??
      regionPresets[0] ??
      DEFAULT_REGION_PRESETS[0],
    [activeRegionKey, regionPresets],
  );

  // ── Time range filter ────────────────────────────────────────────────────
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('all');

  const filteredAlerts = useMemo<AlertMapItem[]>(() => {
    if (!alerts.length) return [];
    const range = TIME_RANGES.find(t => t.key === timeRange);
    if (!range || range.ms === Infinity) return alerts;
    const cutoff = Date.now() - range.ms;
    return alerts.filter(a => new Date(a.updated_at).getTime() >= cutoff);
  }, [alerts, timeRange]);

  const alertCount = filteredAlerts.length;

  // Notify host when alert count changes
  const prevAlertCountRef = React.useRef(alertCount);
  if (prevAlertCountRef.current !== alertCount) {
    prevAlertCountRef.current = alertCount;
    onAlertCountChange?.(alertCount);
  }

  // ── Alert sidebar ────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarOpen = useCallback(() => setSidebarOpen(true), []);
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);

  // ── Layer state ──────────────────────────────────────────────────────────
  const resolvedLayerDefs = layersProp ?? DEFAULT_LAYERS;

  const [layerEnabled, setLayerEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(resolvedLayerDefs.map(l => [l.id, l.enabled])),
  );

  const handleLayerToggle = useCallback((layerId: string, enabled: boolean) => {
    setLayerEnabled(prev => ({ ...prev, [layerId]: enabled }));
    onLayerToggle?.(layerId, enabled);
  }, [onLayerToggle]);

  // Merge enabled state back into layer defs for LayersPanel
  const mergedLayers = useMemo(
    () => resolvedLayerDefs.map(l => ({ ...l, enabled: layerEnabled[l.id] ?? l.enabled })),
    [resolvedLayerDefs, layerEnabled],
  );

  // ── renderMap context ────────────────────────────────────────────────────
  const mapCtx: RenderMapContext = {
    layers: layerEnabled,
    markers,
    alerts: filteredAlerts,
    activeRegion,
    language,
    dir: isAr ? 'rtl' : 'ltr',
    isDark,
  };

  return (
    <div className={cn('w-full h-full relative overflow-hidden', className)}>

      {/* ── Map canvas or placeholder ─────────────────────────────────────── */}
      <div className="absolute inset-0">
        {renderMap ? renderMap(mapCtx) : <MapPlaceholder isDark={isDark} />}
      </div>

      {/* ── Region selector bar ───────────────────────────────────────────── */}
      <div
        className={cn(
          'absolute top-3 z-10 flex items-center gap-0.5',
          'bg-[hsl(var(--warroom-card)/0.95)] backdrop-blur-md',
          'border border-[hsl(var(--warroom-border))] rounded-lg p-0.5 shadow-sm',
          // Position next to layers panel on the opposite side
          isAr ? 'end-[11rem]' : 'start-[11rem]',
        )}
        role="toolbar"
        aria-label={isAr ? 'اختيار المنطقة' : 'Region selector'}
      >
        {regionPresets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => handleRegionSelect(preset.key)}
            aria-pressed={activeRegionKey === preset.key}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-fast ease-standard',
              activeRegionKey === preset.key
                ? 'bg-[hsl(var(--brand-primary))] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--warroom-border)/0.5)]',
            )}
          >
            {isAr ? preset.label_ar : preset.label}
          </button>
        ))}
      </div>

      {/* ── Time-range filter ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'absolute bottom-10 z-10 flex items-center gap-0.5',
          'bg-[hsl(var(--warroom-card)/0.95)] backdrop-blur-md',
          'border border-[hsl(var(--warroom-border))] rounded-lg p-0.5 shadow-sm',
          isAr ? 'end-14' : 'start-14',
        )}
        role="toolbar"
        aria-label={isAr ? 'تصفية النطاق الزمني' : 'Time range filter'}
      >
        <span className="text-[10px] text-muted-foreground px-1.5">
          {isAr ? 'النطاق الزمني' : 'Time range'}
        </span>
        {TIME_RANGES.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTimeRange(t.key as TimeRangeKey)}
            aria-pressed={timeRange === t.key}
            className={cn(
              'px-2.5 py-1 text-[10px] font-medium rounded-md transition-all duration-fast ease-standard',
              timeRange === t.key
                ? 'bg-[hsl(var(--brand-primary))] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--warroom-border)/0.5)]',
            )}
          >
            {isAr ? t.label_ar : t.label_en}
          </button>
        ))}
      </div>

      {/* ── Alert sidebar toggle button ───────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSidebarOpen}
        aria-label={isAr ? 'قائمة التنبيهات' : 'Alert list'}
        className={cn(
          'absolute top-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5',
          'bg-[hsl(var(--warroom-card)/0.95)] backdrop-blur-md',
          'border border-[hsl(var(--warroom-border))] rounded-lg',
          'text-foreground hover:bg-[hsl(var(--warroom-border)/0.5)] transition-all duration-fast ease-standard shadow-sm',
          isAr ? 'start-16' : 'end-3',
        )}
      >
        <span className="text-[11px] font-medium">
          {isAr ? `التنبيهات (${alertCount})` : `Alerts (${alertCount})`}
        </span>
        {alertCount > 0 && (
          <span
            className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-[9px] font-bold text-white"
            aria-hidden="true"
          >
            {alertCount > 99 ? '99+' : alertCount}
          </span>
        )}
      </button>

      {/* ── Alert sidebar ─────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-20 bg-black/10"
            onClick={handleSidebarClose}
            aria-hidden="true"
          />
          <aside
            className={cn(
              'absolute top-0 bottom-0 z-30 w-[300px] flex flex-col',
              'bg-[hsl(var(--warroom-card)/0.97)] backdrop-blur-xl',
              'border-[hsl(var(--warroom-border))] shadow-xl',
              isAr
                ? 'start-0 border-e animate-in slide-in-from-left duration-200'
                : 'end-0 border-s animate-in slide-in-from-right duration-200',
            )}
            dir={isAr ? 'rtl' : 'ltr'}
            aria-label={isAr ? 'التنبيهات الحالية' : 'Current Alerts'}
          >
            <div
              className={cn(
                'flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--warroom-border))]',
                isAr && 'flex-row-reverse',
              )}
            >
              <span className="text-sm font-semibold text-foreground">
                {isAr ? 'التنبيهات الحالية' : 'Current Alerts'}
              </span>
              <button
                type="button"
                onClick={handleSidebarClose}
                aria-label={isAr ? 'إغلاق' : 'Close'}
                className="p-1 rounded-md hover:bg-[hsl(var(--warroom-border)/0.5)] text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/30">
              {filteredAlerts.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {isAr ? 'لا توجد تنبيهات' : 'No alerts'}
                </div>
              ) : (
                filteredAlerts.map(alert => {
                  const sev = (alert.severity ?? 'medium') as AlertSeverity;
                  const sevColor = ALERT_SEVERITY_COLORS[sev] ?? ALERT_SEVERITY_COLORS.medium;
                  const title = isAr && alert.title_ar ? alert.title_ar : alert.title_en;
                  return (
                    <a
                      key={alert.slug}
                      href={`/alert/${alert.slug}`}
                      className="flex items-start gap-2.5 px-4 py-3 hover:bg-muted/30 transition-colors duration-fast ease-standard group border-s-2"
                      style={{ borderInlineStartColor: sevColor }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                        style={{ backgroundColor: sevColor }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary">
                          {title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                          {alert.mode} · {sev}
                        </p>
                      </div>
                    </a>
                  );
                })
              )}
            </div>
          </aside>
        </>
      )}

      {/* ── Layers panel ──────────────────────────────────────────────────── */}
      <MapLayersPanel
        layers={mergedLayers}
        language={language}
        onToggle={handleLayerToggle}
      />

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      <MapLegend language={language} />

    </div>
  );
};

MapPanel.displayName = 'MapPanel';
export default MapPanel;