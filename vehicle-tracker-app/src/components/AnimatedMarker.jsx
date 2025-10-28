import React, { useRef, useEffect, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";

export default function AnimatedMarker({ start, end, duration = 1500 }) {
  const markerRef = useRef(null);
  const map = useMap();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !start || !end) return;

    const startLatLng = L.latLng(start);
    const endLatLng = L.latLng(end);

    if (startLatLng.equals(endLatLng)) {
      marker.setLatLng(endLatLng);
      return;
    }

    // Calculate bearing (degrees)
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const y = Math.sin(toRad(endLngDiff())) * Math.cos(toRad(end.lat));
    const x =
      Math.cos(toRad(start.lat)) * Math.sin(toRad(end.lat)) -
      Math.sin(toRad(start.lat)) *
        Math.cos(toRad(end.lat)) *
        Math.cos(toRad(endLngDiff()));
    function endLngDiff() {
      return end.lng - start.lng;
    }
    const angle = (toDeg(Math.atan2(y, x)) + 360) % 360;
    setRotation(angle);

    const startTime = performance.now();
    const easeInOut = (t) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOut(t);

      const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * eased;
      const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * eased;
      marker.setLatLng([lat, lng]);

      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    // Smooth follow
    try {
      map.panTo(endLatLng, { animate: true, duration: 0.5 });
    } catch (e) {
      console.warn("Pan error", e);
    }
  }, [start, end, duration, map]);

  const adjustedRotation = rotation + 90;

  const carIcon = L.divIcon({
    html: `<div style="
      transform: translate(-50%, -50%) rotate(${adjustedRotation}deg);
      font-size: 30px;
      line-height: 1;
    ">🚗</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: "car-icon",
  });

  return <Marker ref={markerRef} position={end} icon={carIcon} />;
}
