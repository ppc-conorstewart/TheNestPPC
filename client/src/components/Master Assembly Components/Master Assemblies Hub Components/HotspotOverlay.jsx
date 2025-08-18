// ==============================
// Master Assemblies Hub Components/HotspotOverlay.jsx
// ==============================
import { styles } from '../Support Files/maKit';

// ==============================
// Visual tokens for dots
// ==============================
const yellowDotBase = {
  position: 'absolute',
  width: 34,
  height: 34,
  borderRadius: '0%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  fontSize: 18,
  color: '#10110f',
  background: '#ffd84a',
  border: '2px solid #9b8510',
  boxShadow: '0 0 0 2px #000 inset, 0 3px 14px #0007',
  cursor: 'pointer',
  userSelect: 'none',
};

const gasketDotBase = {
  position: 'absolute',
  width: 24,
  height: 24,
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  fontSize: 14,
  color: '#000000ff',
  background: '#70c12aff',
  border: '2px solid #000000ff',
  cursor: 'pointer',
  userSelect: 'none',
};

// ==============================
// Props:
// - heroImageSrc
// - heroBox (from heroBoxFor())
// - isDogBones (bool)
// - dogboneHotspots: [{n,label,left,top}]
// - gasketHotspots:  [{n,label,left,top}]
// - hoverLabel, setHoverLabel
// - hoverGasket, setHoverGasket
// - onHotspotClick(label)
// ==============================
export default function HotspotOverlay({
  heroImageSrc,
  heroBox,
  isDogBones = false,
  dogboneHotspots = [],
  gasketHotspots = [],
  hoverLabel,
  setHoverLabel,
  hoverGasket,
  setHoverGasket,
  onHotspotClick,
}) {
  if (!heroImageSrc) return null;

  return (
    <div style={{ ...styles.heroBox(heroBox), position: 'relative' }}>
      <img src={heroImageSrc} alt="Assembly" style={styles.heroImg} />

      {/* Component hotspots (numbers) */}
      {isDogBones &&
        dogboneHotspots.map((h) => {
          const isHotDot =
            hoverLabel && h.label.toLowerCase() === hoverLabel.toLowerCase();
          return (
            <div
              key={`c-${h.n}`}
              title={`${h.n}: ${h.label}`}
              style={{
                ...yellowDotBase,
                left: h.left,
                top: h.top,
                opacity: 0.92,
                boxShadow: isHotDot
                  ? '0 0 0 2px #000 inset, 0 3px 14px #0007, 0 0 0 3px #ffd84a, 0 0 22px #ffd84a'
                  : yellowDotBase.boxShadow,
              }}
              onMouseEnter={() => setHoverLabel && setHoverLabel(h.label)}
              onMouseLeave={() => setHoverLabel && setHoverLabel(null)}
              onClick={() => onHotspotClick && onHotspotClick(h.label)}
            >
              {h.n}
            </div>
          );
        })}

      {/* Gasket hotspots (green circles) */}
      {isDogBones &&
        gasketHotspots.map((g) => (
          <div
            key={`g-${g.n}`}
            title={g.label}
            style={{ ...gasketDotBase, left: g.left, top: g.top, opacity: 0.96 }}
            onMouseEnter={() => setHoverGasket && setHoverGasket(g.label)}
            onMouseLeave={() => setHoverGasket && setHoverGasket(null)}
          >
            {g.n}
          </div>
        ))}
    </div>
  );
}
