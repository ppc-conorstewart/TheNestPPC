import React from "react";
import { Group, Rect, Text } from "react-konva";

export default function SpacingField({
  x,
  y,
  value,
  unit,
  onClick,
  UNIT_OPTIONS
}) {
  // Bar dimensions
  const width = 120;
  const height = 36;
  return (
    <Group
      x={x - width / 2}
      y={y - height / 2}
      onClick={e => {
        e.cancelBubble = true;
        onClick && onClick();
      }}
      style={{ cursor: "pointer" }}
    >
      <Rect
        width={width}
        height={height}
        fill="#fff"
        stroke="#888"
        strokeWidth={2}
        cornerRadius={10}
        shadowBlur={5}
        shadowColor="#0001"
      />
      <Text
        text={`Spacing: ${value || "___"} ${unit}`}
        width={width}
        height={height}
        align="center"
        verticalAlign="middle"
        fontSize={15}
        fontStyle="bold"
        fill="#363b28"
      />
    </Group>
  );
}
