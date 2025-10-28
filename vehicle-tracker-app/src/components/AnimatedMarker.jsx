import React, { useRef, useEffect, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";

export default function AnimatedMarker({ position, duration = 1000 }) {
  const markerRef = useRef(null);
  const map = useMap();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !position) return;

    const start = marker.getLatLng ? marker.getLatLng() : L.latLng(position);
    const end = L.latLng(position);

    if (!start || (start.lat === end.lat && start.lng === end.lng)) {
      marker.setLatLng(end);
      return;
    }

    // Calculate direction of movement (bearing)
    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    setRotation(angle);

    const startTime = performance.now();

    // Easing function (easeInOutQuad)
    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const easedT = easeInOutQuad(t);

      const lat = start.lat + (end.lat - start.lat) * easedT;
      const lng = start.lng + (end.lng - start.lng) * easedT;
      marker.setLatLng([lat, lng]);

      if (t < 1) requestAnimationFrame(animate);
      else marker.setLatLng(end);
    };

    requestAnimationFrame(animate);

    // Pan map smoothly to follow marker
    try {
      map.panTo(end, { animate: true, duration: 0.5 });
    } catch {
      // ignored
    }
  }, [position, duration, map]);

  // Rotate emoji forward (90° correction for orientation)
  const adjustedRotation = rotation + 90;

  // Create clean rotating car emoji without background box
  const carIcon = L.divIcon({
    html: `<div style="
      transform: translate(-50%, -50%) rotate(${adjustedRotation}deg);
      font-size: 28px;
      line-height: 1;
    ">🚗</div>`,
    iconSize: [30, 30],
    className: "car-icon",
  });

  return <Marker ref={markerRef} position={position} icon={carIcon} />;
}
