import React, { useState } from "react";
import { Group, Circle, Arrow, Text } from "react-konva";

// All-black, sharp, pro North Marker
export default function NorthMarker({ x, y, angle, onRotate, onMove, zoom = 1, pan = { x: 0, y: 0 } }) {
  const [isRotating, setIsRotating] = useState(false);

  // Mouse down: check for Alt key to rotate
  const handlePointerDown = e => {
    if (e.evt.altKey) {
      setIsRotating(true);
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp);
      e.cancelBubble = true;
    }
  };

  const handlePointerMove = e => {
    const stage = document.querySelector("canvas");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const pointer = {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
    const dx = pointer.x - x;
    const dy = pointer.y - y;
    const newAngle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    onRotate(newAngle);
  };

  const handlePointerUp = e => {
    setIsRotating(false);
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
  };

  return (
    <Group
      x={x}
      y={y}
      rotation={angle}
      draggable={!isRotating}
      onDragMove={e => onMove && onMove(e.target.x(), e.target.y())}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      cursor={isRotating ? "crosshair" : "pointer"}
      listening
    >
      {/* Outer Circle: Black border, slight white fill */}
      <Circle
        radius={28}
        fill="#fafafc"
        stroke="#111"
        strokeWidth={3.2}
        shadowBlur={5}
        shadowColor="#000"
      />
      {/* Black Arrow: sharp, with soft shadow */}
      <Arrow
        points={[0, 11, 0, -30]}
        pointerLength={16}
        pointerWidth={18}
        fill="#111"
        stroke="#111"
        shadowForStrokeEnabled
        shadowColor="#333"
        shadowBlur={4}
        opacity={0.98}
      />
      {/* Big Black "N" */}
      <Text
        text="N"
        fontSize={25}
        fontStyle="bold"
        fontFamily="sans-serif"
        x={-11}
        y={-56}
        fill="#111"
        shadowBlur={0}
      />
      {/* "NORTH" label */}
      <Text
        text="NORTH"
        fontSize={11}
        fontStyle="bold"
        fontFamily="sans-serif"
        x={-21}
        y={33}
        fill="#444"
      />
    </Group>
  );
}
