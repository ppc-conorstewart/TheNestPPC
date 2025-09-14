// ==============================
// File: WellGroup.jsx
// ==============================

import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';

// ==============================
// ======= CONSTANTS ============
// ==============================
const BORDER_GREEN = '#6a7257';
const NAME_W = 120;
const NAME_FONT = 12;
const WELL_W = 80;
const WELL_H = 62;

// ==============================
// ======= COMPONENT ============
// ==============================
export default function WellGroup({
  well,
  idx,
  activeTool,
  onSelect,
  onRequestEditName,
  onRequestEditHeight
}) {
  return (
    <Group x={well.x} y={well.y} draggable={activeTool === 'select'} onClick={onSelect}>
      <KonvaImage
        image={(() => {
          const img = new window.Image();
          img.src = process.env.PUBLIC_URL + '/assets/wellhead.png';
          return img;
        })()}
        width={WELL_W}
        height={WELL_H}
        offsetX={WELL_W / 2}
        offsetY={WELL_H / 2}
        shadowBlur={well.selected ? 9 : 2}
        shadowColor={well.selected ? '#6a7257' : '#23241d'}
        opacity={0.97}
        listening={false}
      />

      {well.selected && (
        <Rect
          x={-WELL_W / 2 - 2}
          y={-WELL_H / 2 - 2}
          width={WELL_W + 4}
          height={WELL_H + 4}
          stroke='#6a7257'
          strokeWidth={3}
          cornerRadius={8}
          listening={false}
        />
      )}

      <Text
        text={well.name}
        fontSize={NAME_FONT}
        fill={BORDER_GREEN}
        fontStyle='bold'
        y={-WELL_H / 2 - 22}
        align='center'
        width={NAME_W}
        x={-NAME_W / 2}
        onClick={e => {
          e.cancelBubble = true;
          onRequestEditName && onRequestEditName();
        }}
        onTap={e => {
          e.cancelBubble = true;
          onRequestEditName && onRequestEditName();
        }}
      />

      <Group
        x={0}
        y={WELL_H / 2 + 22}
        onClick={e => {
          e.cancelBubble = true;
          onRequestEditHeight && onRequestEditHeight();
        }}
        onTap={e => {
          e.cancelBubble = true;
          onRequestEditHeight && onRequestEditHeight();
        }}
      >
        <Rect
          x={-240 / 2}
          y={-30 / 2}
          width={240}
          height={30}
          fill='#ffffff'
          stroke='#6a7257'
          strokeWidth={2}
          cornerRadius={10}
          shadowBlur={4}
        />
        <Text
          text={`Height: ${Number(well.heightFeet ?? 0).toFixed(1)} [Feet]  ${Number(well.heightInches ?? 0).toFixed(1)} [Inches]`}
          x={-240 / 2 + 8}
          y={-30 / 2 + 7}
          width={240 - 16}
          align='center'
          verticalAlign='middle'
          fill='#363b28'
          fontSize={12}
          listening={false}
        />
      </Group>
    </Group>
  );
}
