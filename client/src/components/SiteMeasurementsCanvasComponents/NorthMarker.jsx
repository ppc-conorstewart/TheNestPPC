// =====================================================
// File: NorthMarker.jsx
// =====================================================

import { useRef, useState } from 'react';
import { Arrow, Circle, Group, Line, Text } from 'react-konva';

// =================== North Marker (Right-Side Handle, No-Jump, Correct Delta) ===================
export default function NorthMarker({ x, y, angle, onRotate, onMove }) {
  const groupRef = useRef(null);
  const [isRotating, setIsRotating] = useState(false);

  const startAngleRef = useRef(0);
  const startPointerDegRef = useRef(0);

  // Pointer angle in scene coords (0° on +X axis; increases counterclockwise)
  const pointerDeg = stage => {
    const ptr = stage.getPointerPosition();
    if (!ptr) return 0;
    const inv = stage.getAbsoluteTransform().copy().invert();
    const p = inv.point(ptr);
    const c = groupRef.current.getAbsolutePosition();
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const startRotate = e => {
    const stage = groupRef.current?.getStage();
    if (!stage) return;
    e.cancelBubble = true;

    setIsRotating(true);
    startAngleRef.current = angle;
    startPointerDegRef.current = pointerDeg(stage);

    const moveNS = 'mousemove.north';
    const upNS = 'mouseup.north';
    const touchMoveNS = 'touchmove.north';
    const touchEndNS = 'touchend.north';

    const handleMove = () => {
      const current = pointerDeg(stage);
      const delta = current - startPointerDegRef.current;
      const next = startAngleRef.current + delta; // pure delta—no 90° offset
      onRotate && onRotate(next);
    };

    const handleUp = () => {
      setIsRotating(false);
      stage.off(moveNS);
      stage.off(upNS);
      stage.off(touchMoveNS);
      stage.off(touchEndNS);
    };

    stage.on(moveNS, handleMove);
    stage.on(upNS, handleUp);
    stage.on(touchMoveNS, handleMove);
    stage.on(touchEndNS, handleUp);
  };

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      rotation={angle}
      draggable={!isRotating}
      onDragMove={e => onMove && onMove(e.target.x(), e.target.y())}
      listening
    >
      {/* Base circle */}
      <Circle radius={28} fill="#fafafc" stroke="#111" strokeWidth={3.2} shadowBlur={5} shadowColor="#000" />

      {/* Arrow (points up at 0°) */}
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

      {/* Labels */}
      <Text text="N" fontSize={25} fontStyle="bold" fontFamily="sans-serif" x={-11} y={-56} fill="#111" />
      <Text text="NORTH" fontSize={11} fontStyle="bold" fontFamily="sans-serif" x={-21} y={33} fill="#444" />

      {/* Right-side rotation handle */}
      <Line points={[30, 0, 42, 0]} stroke="#6a7257" strokeWidth={2} />
      <Circle
        x={48}
        y={0}
        radius={7}
        fill="#6a7257"
        stroke="#111"
        strokeWidth={1.5}
        onMouseDown={startRotate}
        onTouchStart={startRotate}
        listening
      />
    </Group>
  );
}
