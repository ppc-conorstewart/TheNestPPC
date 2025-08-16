import React, { useEffect, useState } from "react";
import { Group, Image as KonvaImage, Rect, Text } from "react-konva";

const BORDER_GREEN = "#6a7257";

export default function WellGroup({
  well,
  idx,
  activeTool,
  onSelect,
  onDblClick,
  onEditHeight,
  UNIT_OPTIONS
}) {
  // Load wellhead PNG image
  const [imageObj, setImageObj] = useState(null);
  useEffect(() => {
    const img = new window.Image();
    img.src = process.env.PUBLIC_URL + "/assets/wellhead.png";
    img.onload = () => setImageObj(img);
  }, []);

  // Layout tuning
  const wellheadWidth = 80;
  const wellheadHeight = 62;
  const wellheadOffsetX = wellheadWidth / 2;
  const wellheadOffsetY = wellheadHeight / 2;

  // UPGRADE: Make the height bar much wider and adjust text position
  const heightBoxWidth = 140;
  const heightBoxHeight = 32;
  const heightBoxY = wellheadOffsetY + 20;

  return (
    <Group
      x={well.x}
      y={well.y}
      draggable={activeTool === "select"}
      onClick={onSelect}
      onDblClick={onDblClick}
    >
      {/* Wellhead PNG */}
      {imageObj && (
        <KonvaImage
          image={imageObj}
          width={wellheadWidth}
          height={wellheadHeight}
          offsetX={wellheadOffsetX}
          offsetY={wellheadOffsetY}
          shadowBlur={well.selected ? 9 : 2}
          shadowColor={well.selected ? "#6a7257" : "#23241d"}
          opacity={0.97}
          listening={false}
        />
      )}

      {/* Highlight on selection */}
      {well.selected && (
        <Rect
          x={-wellheadOffsetX - 2}
          y={-wellheadOffsetY - 2}
          width={wellheadWidth + 4}
          height={wellheadHeight + 4}
          stroke="#6a7257"
          strokeWidth={3}
          cornerRadius={8}
          listening={false}
        />
      )}

      {/* Name label */}
      <Text
        text={well.name}
        fontSize={14}
        fill={BORDER_GREEN}
        fontStyle="bold"
        y={-wellheadOffsetY - 22}
        align="center"
        width={80}
        x={-40}
      />

      {/* Height box - wider */}
      <Group
        x={0}
        y={heightBoxY}
        onClick={onEditHeight}
        style={{ cursor: "pointer" }}
      >
        <Rect
          x={-heightBoxWidth / 2}
          y={-heightBoxHeight / 2}
          width={heightBoxWidth}
          height={heightBoxHeight}
          fill="#fff"
          stroke="#888"
          strokeWidth={2}
          cornerRadius={10}
          shadowBlur={4}
        />
        <Text
          text={`Height: ${well.heightValue || "___"} ${well.heightUnit || "in"}`}
          x={-heightBoxWidth / 2 + 8}
          y={-heightBoxHeight / 2 + 6}
          width={heightBoxWidth - 16}
          align="center"
          verticalAlign="middle"
          fill="#363b28"
          fontSize={15}
          listening={false}
        />
      </Group>
    </Group>
  );
}
