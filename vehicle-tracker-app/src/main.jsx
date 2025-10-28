import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Leaflet CSS (important)
import 'leaflet/dist/leaflet.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
