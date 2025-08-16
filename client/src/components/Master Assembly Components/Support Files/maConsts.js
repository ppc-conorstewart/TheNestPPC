// ==============================
// src/components/Master Assembly Components/Support Files/maConsts.js
// ==============================
export const palomaGreen = '#6a7257';
export const goldAccent = '#b0b79f';
export const cardBg = 'rgba(14,15,14,0.98)';
export const glassBorder = '2.5px solid #35392E';

export const dogboneChildren = ['Dogbone-A','Dogbone-B','Dogbone-C','Dogbone-D','Dogbone-E','Dogbone-F'];
export const zipperChildren  = ['Zipper - A','Zipper - B','Zipper - C','Zipper - D','Zipper - E','Zipper - F'];

export const dogboneAssetFields = [
  'Front Bottom Rotator',
  'Front 7-15K Tee',
  'Front Top Adapter',
  '7-15K Spool',
  'Rear 7-15K Blind Flange',
  'Rear 7-15K Tee',
  'Rear Bottom Rotator',
];
export const zipperAssetFields = ['Bottom 7-15K Tee','Bottom Zipper Valve','Upper Zipper Valve'];

export const dogboneLegend = [
  { n: '1', label: 'Front Bottom Rotator' },
  { n: '2', label: 'Front 7-15K Tee' },
  { n: '3', label: 'Front Top Adapter' },
  { n: '4', label: '7-15K Spool' },
  { n: '5', label: 'Rear 7-15K Blind Flange' },
  { n: '6', label: 'Rear 7-15K Tee' },
  { n: '7', label: 'Rear Bottom Rotator' },
];
export const zipperLegend = [
  { n: '1', label: 'Bottom 7-15K Tee' },
  { n: '2', label: 'Bottom Zipper Valve' },
  { n: '3', label: 'Upper Zipper Valve' },
];

export const TABS = [
  { id: 'Pod #1', title: 'Pod #1',   imgKey: 'pod1' },
  { id: 'Pod #2', title: 'Pod #2',   imgKey: 'pod2' },
  { id: 'Check Valve Assembly', title: 'Check Valve Assembly', imgKey: 'check' },
  { id: 'Bleed Off Skid', title: 'Bleed Off Skid', imgKey: 'bleed' },
];

export const POD1_LABELS = ['1A','1B','1C','1D','1E','1F','2A','2B','2C','2D','3A','3B','4A','4B','4C','4D','4E','4F'];
export const POD2_LABELS = ['1A','1B','1C','1D','1E','1F','2A','2B','2C','2D','4A','4B','4C','4D','4E','4F'];
export const CHECK_VALVE_LABELS = ['1A','1B','1C','1D','2A','2B','2C','2D','3A','3B','3C','3D','4A','4B','5A','5B','6A','6B','7A','7B'];
export const BLEED_OFF_LABELS = ['1A','1B','1C','1D','2A','2B','3A','3B','3C','3D','4A','4B'];

export const DIGIT_COLOR = {
  '1': '#59b6ff',
  '2': '#ff6268',
  '3': '#43d089',
  '4': '#ffd95e',
  '5': '#9b6cff',
  '6': '#ff6eb3',
  '7': '#ffa44d',
};
export const NEUTRAL_LABEL = '#8e9481';

// ==============================
// Added to satisfy imports used across panels
// ==============================

// If/when Flowcross or Missile masters are wired, add labels here.
export const flowcrossAssetFields = [];   // keeps compile stable
export const missileAssetFields   = [];

// Hotspot coordinates for Dogbone hero (percent units, tuned for ~980x220 image)
export const dogboneHotspots = [
  { n: '1', label: 'Front Bottom Rotator', left: '10%', top: '58%' },
  { n: '2', label: 'Front 7-15K Tee',      left: '22%', top: '58%' },
  { n: '3', label: 'Front Top Adapter',    left: '22%', top: '42%' },
  { n: '4', label: '7-15K Spool',          left: '43%', top: '50%' },
  { n: '5', label: 'Rear 7-15K Blind Flange', left: '64%', top: '42%' },
  { n: '6', label: 'Rear 7-15K Tee',       left: '64%', top: '58%' },
  { n: '7', label: 'Rear Bottom Rotator',  left: '78%', top: '58%' },
];

// Gasket points (green dots) along primary joints
export const gasketHotspots = [
  { n: '1', label: 'Rotator X Tee',  left: '16%', top: '50%' },
  { n: '2', label: 'Tee x Spool',    left: '32%', top: '50%' },
  { n: '3', label: 'Adapter X Tee',  left: '20%', top: '40%' },
  { n: '4', label: 'Spool X Tee',    left: '52%', top: '50%' },
  { n: '5', label: 'Blind x Tee',    left: '66%', top: '40%' },
  { n: '6', label: 'Tee X Rotator',  left: '72%', top: '58%' },
];
