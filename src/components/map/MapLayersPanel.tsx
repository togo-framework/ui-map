'use client'

/**
 * MapLayersPanel — collapsible layer visibility toggles.
 *
 * Ported from app/src/components/situation-map/LayersPanel.tsx (the companion
 * panel that was part of the SituationMapEmbed). Extracted as a standalone
 * component so it can be used independently of the full map panel.
 *
 * Adaptations:
 * - @/lib/utils → ../../lib/utils
 * - useLanguage removed — language prop instead
 * - Layer definitions injectable via props
 */

import { useState } from 'react';
import { Layers, ChevronDown } from 'lucide-react';
import { cn } from '@togo-framework/ui-core';
import type { MapLayer } from './types';
import { DEFAULT_LAYERS } from './mapDefaults';

export interface MapLayersPanelProps {
  /** Layer toggle entries. Defaults to DEFAULT_LAYERS from mapDefaults. */
  layers?: MapLayer[];
  /** Language code — 'en' | 'ar' */
  language?: string;
  /** Called when a layer toggle changes */
  onToggle?: (layerId: string, enabled: boolean) => void;
  /** Additional class name on root */
  className?: string;
}

export const MapLayersPanel = ({
  layers = DEFAULT_LAYERS,
  language = 'en',
  onToggle,
  className,
}: MapLayersPanelProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isAr = language === 'ar';

  const handleToggle = () => setCollapsed(prev => !prev);

  return (
    <div
      className={cn(
        'absolute top-3 z-10',
        isAr ? 'end-3' : 'start-3',
        className,
      )}
    >
      <div className="bg-[hsl(var(--warroom-card)/0.95)] backdrop-blur-md border border-[hsl(var(--warroom-border))] rounded-lg shadow-sm overflow-hidden min-w-[160px]">
        {/* Header */}
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={!collapsed}
          aria-label={isAr ? 'تبديل لوحة الطبقات' : 'Toggle layers panel'}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-[hsl(var(--warroom-border)/0.3)] transition-colors duration-fast ease-standard"
        >
          <div className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-[hsl(var(--brand-primary))]" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-foreground">
              {isAr ? 'الطبقات' : 'Layers'}
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

        {/* Layer list */}
        {!collapsed && (
          <div className="px-3 pb-2.5 space-y-1.5" dir={isAr ? 'rtl' : 'ltr'}>
            {layers.map((layer) => (
              <label
                key={layer.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={layer.enabled}
                  onChange={() => onToggle?.(layer.id, !layer.enabled)}
                  className="sr-only"
                  aria-label={isAr ? layer.label_ar : layer.label}
                />
                {/* Visual checkbox */}
                <span
                  className={cn(
                    'w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center transition-colors duration-fast ease-standard',
                    layer.enabled
                      ? 'border-transparent'
                      : 'border-muted-foreground/40 bg-transparent',
                  )}
                  style={layer.enabled && layer.color
                    ? { backgroundColor: layer.color }
                    : undefined}
                  aria-hidden="true"
                >
                  {layer.enabled && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors duration-fast ease-standard leading-none">
                  {isAr ? layer.label_ar : layer.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

MapLayersPanel.displayName = 'MapLayersPanel';
export default MapLayersPanel;