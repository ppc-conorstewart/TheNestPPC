import React from "react";
import { Line } from "react-konva";

export default function Grid({ width, height, spacing = 40, scale = 1, offsetX = 0, offsetY = 0, showGrid = true }) {
  if (!showGrid) return null;
  const lines = [];
  for (let x = (-offsetX % (spacing * scale)); x < width; x += spacing * scale) {
    lines.push(<Line key={`vx${x}`} points={[x, 0, x, height]} stroke="#e6e8df" strokeWidth={1} opacity={0.14} />);
  }
  for (let y = (-offsetY % (spacing * scale)); y < height; y += spacing * scale) {
    lines.push(<Line key={`hz${y}`} points={[0, y, width, y]} stroke="#e6e8df" strokeWidth={1} opacity={0.14} />);
  }
  return <>{lines}</>;
}
