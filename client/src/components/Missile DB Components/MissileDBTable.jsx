// =================== MissileDBTable.jsx ===================
// Wrapper component that reuses the existing AssetTable so the
// layout/behavior is EXACTLY the same as Assets Main, while
// keeping the implementation modular for future Missile-only tweaks.

import AssetTable from '../Asset Components/AssetTable';

export default function MissileDBTable(props) {
  // For now, we directly pass everything through to AssetTable.
  // If you later want to scope this tab to a subset (e.g., category === 'MISSILE'),
  // you can filter props.assets here before passing along.
  // Example:
  // const filteredAssets = (props.assets || []).filter(a => a.category === 'MISSILE');
  // return <AssetTable {...props} assets={filteredAssets} />;

  return <AssetTable {...props} />;
}
