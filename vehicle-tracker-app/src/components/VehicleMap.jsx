import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AnimatedMarker from "./AnimatedMarker";
import Controls from "./Controls";
import { calculateSpeedKmH } from "../utils/calculate";

// 🗺️ Fit bounds only once
function FitBoundsOnce({ coords }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && coords.length) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
      map.setZoom(18);
      fitted.current = true;
    }
  }, [coords, map]);
  return null;
}

// 🚘 Follow car during play
function AutoFollow({ isPlaying, position }) {
  const map = useMap();
  const userInteracted = useRef(false);

  useMapEvents({
    dragstart: () => (userInteracted.current = true),
    zoomstart: () => (userInteracted.current = true),
  });

  useEffect(() => {
    if (isPlaying && position && !userInteracted.current) {
      map.panTo(position, { animate: true, duration: 1 });
    }
  }, [isPlaying, position, map]);

  return null;
}

export default function VehicleMap({ dataUrl = "/dummy-route.json" }) {
  const [route, setRoute] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch(dataUrl)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((p) => ({
          lat: p.latitude,
          lng: p.longitude,
          timestamp: new Date(p.timestamp),
        }));
        setRoute(formatted);
      })
      .catch((e) => console.error("Error loading route:", e));
  }, [dataUrl]);

  useEffect(() => {
    if (isPlaying && route.length > 1 && currentIndex < route.length - 1) {
      const t1 = new Date(route[currentIndex].timestamp).getTime();
      const t2 = new Date(route[currentIndex + 1].timestamp).getTime();
      const intervalMs = Math.max(t2 - t1, 1200); // fallback if missing timestamps
      intervalRef.current = setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, intervalMs);
    } else {
      clearTimeout(intervalRef.current);
    }
    return () => clearTimeout(intervalRef.current);
  }, [isPlaying, currentIndex, route]);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const fullCoords = route.map((p) => [p.lat, p.lng]);
  const traveledCoords = route.slice(0, currentIndex + 1).map((p) => [p.lat, p.lng]);

  const currentPoint = route[currentIndex] || route[0];
  const nextPoint = route[currentIndex + 1] || route[currentIndex];
  const speed = calculateSpeedKmH(currentIndex, route);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[17.385044, 78.486671]}
        zoom={18}
        scrollWheelZoom
        className="h-screen w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Full route in gray */}
        {fullCoords.length > 0 && (
          <Polyline positions={fullCoords} pathOptions={{ color: "gray", weight: 3 }} />
        )}

        {/* Traveled route in red */}
        {traveledCoords.length > 0 && (
          <Polyline positions={traveledCoords} pathOptions={{ color: "red", weight: 5 }} />
        )}

        {/* Animated car moving over line */}
        {currentPoint && nextPoint && (
          <AnimatedMarker start={currentPoint} end={nextPoint} duration={1200} />
        )}

        <FitBoundsOnce coords={fullCoords} />
        <AutoFollow isPlaying={isPlaying} position={L.latLng(currentPoint)} />
      </MapContainer>

      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        togglePlay={handlePlayPause}
        reset={handleReset}
        currentPoint={currentPoint}
        speed={speed}
      />
    </div>
  );
}
