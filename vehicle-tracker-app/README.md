# Vehicle Tracker App

## Overview
Frontend-only React app that simulates a vehicle moving along a predefined route using React-Leaflet and Tailwind CSS. Marker animates smoothly along a polyline, rotates to heading, and control panel provides play/pause/reset and metadata.

## Install & Run
1. `npm install`
2. `npm run dev`
3. Open http://localhost:5173

## Build
`npm run build`

## Files
- `public/dummy-route.json` — route data (lat, lng, timestamp)
- `src/components/VehicleMap.jsx` — main map and controls integration
- `src/components/AnimatedMarker.jsx` — smooth interpolation and rotation
- `src/components/Controls.jsx` — UI controls
- `src/utils/calculate.js` — distance / speed helpers

## Notes
- Uses OpenStreetMap tiles. To get snapped-to-road routes, use Mapbox/OSRM map matching and replace `dummy-route.json`.
- For production, consider using a paid tile provider for higher fidelity and attribution.

## Live Demo
<PUT YOUR DEPLOYED LINK HERE>

