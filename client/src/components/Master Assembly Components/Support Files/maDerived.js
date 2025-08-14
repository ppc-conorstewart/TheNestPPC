// ==============================
// src/components/Master Assembly Components/Support Files/maDerived.js
// Derived groupings and labels
// ==============================

export function makeGroupings(isDogBones, isZippers, resolvedFields) {
  if (isDogBones) {
    return [{ title: '', labels: [
      'Front Bottom Rotator',
      'Front 7-15K Tee',
      'Front Top Adapter',
      '7-15K Spool',
      'Rear 7-15K Blind Flange',
      'Rear 7-15K Tee',
      'Rear Bottom Rotator',
    ] }];
  }
  if (isZippers) {
    return [{ title: 'Zipper Assembly', labels: ['Bottom 7-15K Tee','Bottom Zipper Valve','Upper Zipper Valve'] }];
  }
  return [{ title: 'Assets', labels: resolvedFields || [] }];
}
