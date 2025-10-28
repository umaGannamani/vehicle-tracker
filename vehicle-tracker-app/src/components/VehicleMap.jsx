import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🚗 Rotating car icon (no white box)
function RotatingMarker({ position, rotation }) {
  const adjustedRotation = rotation + 90;

  const icon = L.divIcon({
    html: `<div style="
      transform: translate(-50%, -50%) rotate(${adjustedRotation}deg);
      font-size: 30px;
    ">🚗</div>`,
    iconSize: [30, 30],
    className: "car-icon",
  });

  return <Marker position={position} icon={icon} />;
}

// 📍 Fit map bounds initially
function FitBoundsOnce({ coords }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (!hasFitted.current && coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
      map.setZoom(17); // 🔍 Start closer for detailed street view
      hasFitted.current = true;
    }
  }, [coords, map]);

  return null;
}

// 🚘 Auto-follow car while playing
function AutoFollow({ isPlaying, position }) {
  const map = useMap();
  const userInteracted = useRef(false);

  useMapEvents({
    dragstart: () => (userInteracted.current = true),
    zoomstart: () => (userInteracted.current = true),
  });

  useEffect(() => {
    if (isPlaying && position && !userInteracted.current) {
      map.panTo(position, { animate: true, duration: 1.2 });
      map.setZoom(18); // 🔎 Zoom in even more while following
    }
  }, [position, isPlaying, map]);

  return null;
}

export default function VehicleMap({ dataUrl = "/dummy-route.json" }) {
  const [route, setRoute] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Load route from JSON
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
      .catch((err) => console.error("Failed to load route data:", err));
  }, [dataUrl]);

  // Animation interval
  useEffect(() => {
    if (isPlaying && route.length > 1 && currentIndex < route.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((i) => Math.min(i + 1, route.length - 1));
      }, 1500);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, route, currentIndex]);

  const handlePlayPause = () => setIsPlaying((v) => !v);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const fullCoords = route.map((p) => [p.lat, p.lng]);
  const traveledCoords = route.slice(0, currentIndex + 1).map((p) => [p.lat, p.lng]);
  const currentPoint = route[currentIndex] || route[0] || { lat: 0, lng: 0 };

  // 🔄 Calculate rotation direction
  const calculateBearing = (start, end) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const y = Math.sin(toRad(end.lng - start.lng)) * Math.cos(toRad(end.lat));
    const x =
      Math.cos(toRad(start.lat)) * Math.sin(toRad(end.lat)) -
      Math.sin(toRad(start.lat)) *
        Math.cos(toRad(end.lat)) *
        Math.cos(toRad(end.lng - start.lng));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  const rotation =
    currentIndex < route.length - 1
      ? calculateBearing(route[currentIndex], route[currentIndex + 1])
      : 0;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[17.385044, 78.486671]}
        zoom={17} // 🌆 Start zoomed in to see streets
        scrollWheelZoom={true}
        className="h-screen w-full"
      >
        {/* 🗺️ High-detail map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Full route (gray line) */}
        {fullCoords.length > 0 && (
          <Polyline
            positions={fullCoords}
            pathOptions={{ color: "gray", weight: 3, opacity: 0.5 }}
          />
        )}

        {/* Traveled route (red line) */}
        {traveledCoords.length > 0 && (
          <Polyline
            positions={traveledCoords}
            pathOptions={{ color: "red", weight: 5, opacity: 0.9 }}
          />
        )}

        {/* 🚗 Rotating marker */}
        <RotatingMarker position={[currentPoint.lat, currentPoint.lng]} rotation={rotation} />

        {/* Fit once at start */}
        <FitBoundsOnce coords={fullCoords} />

        {/* Follow car */}
        <AutoFollow
          isPlaying={isPlaying}
          position={L.latLng(currentPoint.lat, currentPoint.lng)}
        />
      </MapContainer>

      {/* 🧭 Control panel */}
      <div className="absolute top-4 right-4 z-[1000] p-4 bg-white shadow-lg rounded-lg w-max">
        <h2 className="font-bold mb-2">Vehicle Status</h2>
        <div className="text-sm">
          <p>
            <strong>Coords:</strong>{" "}
            <span className="font-mono">
              {currentPoint.lat.toFixed(6)}, {currentPoint.lng.toFixed(6)}
            </span>
          </p>
          <p>
            <strong>Time:</strong>{" "}
            {currentPoint.timestamp ? currentPoint.timestamp.toLocaleTimeString() : "N/A"}
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handlePlayPause}
            className={`px-4 py-2 rounded ${
              isPlaying ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 rounded text-gray-800"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
