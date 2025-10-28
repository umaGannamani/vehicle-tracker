export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateSpeedKmH(index, route) {
  if (!route || route.length < 2 || index <= 0) return 0;
  const curr = route[index];
  const prev = route[index - 1];
  const distKm = haversineDistanceKm(prev.lat, prev.lng, curr.lat, curr.lng);
  const t1 = new Date(prev.timestamp).getTime();
  const t2 = new Date(curr.timestamp).getTime();
  const deltaHours = (t2 - t1) / (1000 * 60 * 60);
  if (deltaHours <= 0) return 0;
  return distKm / deltaHours;
}
