<!-- togo-header -->
# @togo-framework/ui-map

> [!WARNING]
> **Deprecated.** This package is no longer maintained. togo now uses
> [Nasaq](https://nasaq.fadymondy.com) (`@fadymondy/nasaq`) as its default UI kit:
> new apps from `create-togo-app` and the official plugins are built on it.
> Install it with `npm i @fadymondy/nasaq` and import from `@fadymondy/nasaq/web`.

Leaflet/OpenStreetMap map view + chrome (legend, layers panel, region presets,
event map panel) from the togo UI kit. Requires `@togo-framework/ui-core`.

```bash
npm install @togo-framework/ui-map @togo-framework/ui-core leaflet
```

```tsx
import { MapView } from "@togo-framework/ui-map";
```

This package was split out of the former monolithic `@togo-framework/ui` to
let apps install only the pieces they actually use.
<!-- togo-sponsors -->
