// ==============================
// File: SpacingField.jsx
// ==============================

import { Group, Rect, Text } from 'react-konva';

// ==============================
// ======= CONSTANTS ============
// ==============================
const BOX_W = 240;
const BOX_H = 30;
const FONT = 12;

// ==============================
// ======= COMPONENT ============
// ==============================
export default function SpacingField({
  x,
  y,
  feet = 0,
  inches = 0,
  onRequestEdit
}) {
  return (
    <Group
      x={x - BOX_W / 2}
      y={y - BOX_H / 2}
      onClick={e => {
        e.cancelBubble = true;
        onRequestEdit && onRequestEdit();
      }}
      onTap={e => {
        e.cancelBubble = true;
        onRequestEdit && onRequestEdit();
      }}
      listening
    >
      <Rect width={BOX_W} height={BOX_H} fill='#ffffff' cornerRadius={10} stroke='#6a7257' strokeWidth={2} shadowBlur={4} />
      <Text
        text={`Spacing: ${Number(feet).toFixed(1)} [Feet]  ${Number(inches).toFixed(1)} [Inches]`}
        width={BOX_W}
        height={BOX_H}
        align='center'
        verticalAlign='middle'
        fontSize={FONT}
        fontStyle='bold'
        fill='#363b28'
        listening={false}
      />
    </Group>
  );
}
