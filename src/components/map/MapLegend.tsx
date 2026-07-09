'use client'

/**
 * MapLegend — collapsible map legend panel.
 *
 * Ported from app/src/components/situation-map/MapLegend.tsx.
 *
 * Adaptations:
 * - @/components/ui/*  → ../ui/*
 * - @/lib/utils        → ../../lib/utils
 * - useLanguage removed — language/dir passed as props
 * - MARKER_COLORS / MARKER_LABELS inlined from mapDefaults (no @/data dep)
 * - LegendGroups data injectable via `groups` prop (defaults to MENA presets)
 * - No 'use client' directive — sentra-ui ships framework-agnostic; RSC is
 *   handled by the consuming product's bundler.
 */

import { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import { cn } from '@togo-framework/ui-core';
import {
  MARKER_COLORS,
  MARKER_LABELS,
  DEFAULT_LEGEND_GROUPS,
} from './mapDefaults';
import type { LegendGroup, LegendShapeType, MapMarkerType } from './types';

// ─── Shape icon ───────────────────────────────────────────────────────────────

interface ShapeIconProps {
  shape: LegendShapeType;
  color: string;
}

const ShapeIcon = ({ shape, color }: ShapeIconProps) => {
  const size = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className="shrink-0" aria-hidden="true">
      {shape === 'diamond' && (
        <rect x="2" y="2" width="8" height="8" rx="1" fill={color} transform="rotate(45 6 6)" />
      )}
      {shape === 'burst' && (
        <polygon
          points="6,0.5 7.5,4 11.5,4 8.5,6.5 9.5,10.5 6,8 2.5,10.5 3.5,6.5 0.5,4 4.5,4"
          fill={color}
        />
      )}
      {shape === 'chevron' && (
        <path
          d="M2 8 L6 3 L10 8"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {shape === 'triangle' && (
        <polygon points="6,1.5 11,10.5 1,10.5" fill={color} />
      )}
      {shape === 'hexagon' && (
        <polygon points="6,1 10.5,3.5 10.5,8.5 6,11 1.5,8.5 1.5,3.5" fill={color} />
      )}
      {shape === 'ring' && (
        <circle cx="6" cy="6" r="4.5" fill="none" stroke={color} strokeWidth="2" />
      )}
      {shape === 'pill' && (
        <rect x="1" y="3.5" width="10" height="5" rx="2.5" fill={color} />
      )}
      {shape === 'square' && (
        <rect x="2" y="2" width="8" height="8" rx="1.5" fill={color} />
      )}
    </svg>
  );
};
ShapeIcon.displayName = 'ShapeIcon';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MapLegendProps {
  /** Language code — 'en' | 'ar'. Controls label language and RTL positioning. */
  language?: string;
  /** Override legend groups (marker types + shapes). Defaults to MENA presets. */
  groups?: LegendGroup[];
  /**
   * Marker color map — keys are MapMarkerType strings, values are hex colors.
   * Defaults to MARKER_COLORS from mapDefaults.
   */
  markerColors?: Partial<Record<MapMarkerType, string>>;
  /**
   * Marker label map — keys are MapMarkerType strings.
   * Defaults to MARKER_LABELS from mapDefaults.
   */
  markerLabels?: Partial<Record<MapMarkerType, { en: string; ar: string }>>;
  /** Additional class name on the root element */
  className?: string;
  /** Initially collapsed. Defaults to false (expanded). */
  defaultCollapsed?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MapLegend = ({
  language = 'en',
  groups = DEFAULT_LEGEND_GROUPS,
  markerColors,
  markerLabels,
  className,
  defaultCollapsed = false,
}: MapLegendProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const isAr = language === 'ar';

  const resolvedColors = { ...MARKER_COLORS, ...markerColors };
  const resolvedLabels = { ...MARKER_LABELS, ...markerLabels };

  const handleToggle = () => setCollapsed(prev => !prev);

  return (
    <div
      className={cn(
        'absolute bottom-8 z-10',
        isAr ? 'start-14' : 'end-14',
        className,
      )}
    >
      <div className="bg-[hsl(var(--warroom-card)/0.95)] backdrop-blur-md border border-[hsl(var(--warroom-border))] rounded-lg shadow-sm overflow-hidden min-w-[160px]">
        {/* Header */}
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={!collapsed}
          aria-label={isAr ? 'تبديل مفتاح الخريطة' : 'Toggle map legend'}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-[hsl(var(--warroom-border)/0.3)] transition-colors duration-fast ease-standard"
        >
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-[hsl(var(--brand-primary))]" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-foreground">
              {isAr ? 'مفتاح الخريطة' : 'Legend'}
            </span>
          </div>
          <ChevronDown
            className={cn(
              'h-3 w-3 text-muted-foreground transition-transform duration-fast ease-standard',
              collapsed && '-rotate-90',
            )}
            aria-hidden="true"
          />
        </button>

        {/* Content */}
        {!collapsed && (
          <div className="px-3 pb-2.5 space-y-2" dir={isAr ? 'rtl' : 'ltr'}>
            {groups.map((group) => (
              <div key={group.label}>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 block mb-1">
                  {isAr ? group.label_ar : group.label}
                </span>
                <div className="space-y-1">
                  {group.items.map(({ type, shape }) => {
                    const label = resolvedLabels[type];
                    const color = resolvedColors[type] ?? '#888';
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <ShapeIcon shape={shape} color={color} />
                        <span className="text-[10px] text-muted-foreground leading-none">
                          {label ? (isAr ? label.ar : label.en) : type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Severity scale */}
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 block mb-1">
                {isAr ? 'الخطورة' : 'Severity'}
              </span>
              <div className="flex items-center gap-1">
                <div
                  className="flex-1 h-1.5 rounded-full"
                  style={{ background: 'linear-gradient(to right, #eab308, #f97316, #dc2626)' }}
                />
              </div>
              <div className={cn('flex justify-between mt-0.5', isAr && 'flex-row-reverse')}>
                <span className="text-[8px] text-muted-foreground/50">
                  {isAr ? 'متصاعد' : 'Elevated'}
                </span>
                <span className="text-[8px] text-muted-foreground/50">
                  {isAr ? 'حرج' : 'Critical'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MapLegend.displayName = 'MapLegend';
export default MapLegend;