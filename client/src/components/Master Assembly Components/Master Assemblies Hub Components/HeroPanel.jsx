// ==============================
// src/components/Master Assembly Components/Master Assemblies Hub Components/HeroPanel.jsx
// Hero image + hotspots wrapper (adds ambient status-based glow; visual only)
// ==============================

import masterDogboneImg from '../../../assets/Master Assemblies/MasterDogbone.png';
import masterZipperImg from '../../../assets/Master Assemblies/MasterZipper.png';
import { dogboneHotspots, gasketHotspots } from '../Support Files/hotspotMaps';
import { heroBoxFor } from '../Support Files/maKit';
import { AmbientGlow, colorForStatus } from '../Support Files/maShared';
import HotspotOverlay from './HotspotOverlay';

export default function HeroPanel({
  isDogBones = false,
  isZippers = false,
  status = 'Inactive',           // NEW: for glow color only
  hoverLabel = null,
  setHoverLabel = () => {},
  hoverGasket = null,
  setHoverGasket = () => {},
  onHotspotClick = () => {}
}) {
  const showDogboneImage = isDogBones;
  const showZipperImage  = isZippers;
  const heroImageSrc = showDogboneImage ? masterDogboneImg : showZipperImage ? masterZipperImg : null;
  const heroBox = (showDogboneImage || showZipperImage) ? heroBoxFor(showDogboneImage ? 'dogbone' : 'zipper') : heroBoxFor('default');
  const glowColor = colorForStatus(status);

  if (!heroImageSrc) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AmbientGlow color={glowColor} intensity={0.22} />
      <HotspotOverlay
        heroImageSrc={heroImageSrc}
        heroBox={heroBox}
        isDogBones={isDogBones}
        dogboneHotspots={dogboneHotspots}
        gasketHotspots={gasketHotspots}
        hoverLabel={hoverLabel}
        setHoverLabel={setHoverLabel}
        hoverGasket={hoverGasket}
        setHoverGasket={setHoverGasket}
        onHotspotClick={onHotspotClick}
      />
    </div>
  );
}
