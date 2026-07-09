'use client'

/**
 * EventMapPanel — location card for an event artifact.
 *
 * Ported from app/src/components/capability-sections/event/event-map-panel.tsx.
 *
 * Adaptations:
 * - @/components/ui/card → ../ui/card
 * - useEventArtifact / SectionComponentProps removed — data passed as props
 * - language / location as direct props
 *
 * Returns null when no location is available (matching the source behaviour
 * where section_visible=FALSE).
 */

import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@togo-framework/ui-core';

export interface EventMapPanelProps {
  /** Structured location string — if absent the panel renders nothing */
  location?: string | null;
  /** Language code — 'en' | 'ar' */
  language?: string;
}

export const EventMapPanel = ({ location, language = 'en' }: EventMapPanelProps) => {
  if (!location) return null;

  const isAr = language === 'ar';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
          {isAr ? 'الموقع' : 'Location'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className="text-sm text-foreground p-3 bg-muted/30 rounded-lg"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {location}
        </p>
      </CardContent>
    </Card>
  );
};

EventMapPanel.displayName = 'EventMapPanel';
export default EventMapPanel;
