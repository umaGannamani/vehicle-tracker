import React from "react";

export default function Controls({
  isPlaying,
  togglePlay,
  reset,
  currentPoint,
  speed,
}) {
  const lat = currentPoint?.lat?.toFixed(6) ?? "-";
  const lng = currentPoint?.lng?.toFixed(6) ?? "-";
  const ts = currentPoint?.timestamp
    ? new Date(currentPoint.timestamp).toLocaleTimeString()
    : "-";

  return (
    <div className="absolute top-4 right-4 z-[1000] p-4 bg-white/95 shadow-lg rounded-lg w-72">
      <h3 className="text-lg font-semibold mb-2">Vehicle Status</h3>
      <div className="text-sm space-y-1">
        <p>
          <span className="font-semibold">Coords:</span>{" "}
          <span className="font-mono text-blue-600">{lat}, {lng}</span>
        </p>
        <p>
          <span className="font-semibold">Time:</span> {ts}
        </p>
        <p>
          <span className="font-semibold">Speed:</span>{" "}
          {speed.toFixed(2)} km/h
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={togglePlay}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white ${
            isPlaying ? "bg-red-500" : "bg-green-600"
          }`}
        >
          {isPlaying ? "Pause" : "Play"}
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
