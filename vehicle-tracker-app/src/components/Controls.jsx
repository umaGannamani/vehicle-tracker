import React from 'react';

export default function Controls({
  isPlaying,
  togglePlay,
  reset,
  currentPosition,
  currentSpeed
}) {
  const lat = currentPosition?.lat?.toFixed?.(6) ?? '-';
  const lng = currentPosition?.lng?.toFixed?.(6) ?? '-';
  const ts = currentPosition?.timestamp ? new Date(currentPosition.timestamp).toLocaleTimeString() : '-';

  return (
    <div className="absolute top-4 right-4 z-50 p-4 bg-white/95 shadow-lg rounded-lg w-full max-w-xs">
      <h3 className="text-lg font-semibold mb-2">Vehicle Status</h3>

      <div className="text-sm space-y-1">
        <p>Coordinates:
          <span className="font-mono ml-2 text-blue-600">{lat}, {lng}</span>
        </p>
        <p>Timestamp:
          <span className="ml-2">{ts}</span>
        </p>
        <p>Speed:
          <span className="ml-2">{Number(currentSpeed).toFixed(2)} km/h</span>
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={togglePlay}
          className="flex-1 px-4 py-2 rounded-lg text-white font-semibold"
          style={{ backgroundColor: isPlaying ? '#ef4444' : '#16a34a' }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
