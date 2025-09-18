// ==============================
// File: src/components/ModalsContainer.jsx
// ==============================

import AddAssetModal from './Asset Components/AddAssetModal';

import EditAssetModal from './Asset Components/EditAssetModal';

import PalomaQRCodeModal from './Asset Components/PalomaQRCodeModal';
import PhysicalAssetTransferModal from './Asset Components/PhysicalAssetTransferModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TransferModal from './TransferModal';
import TransferSuccessModal from './TransferSuccessModal';

// ==============================
// COMPONENT — MODALS CONTAINER
// ==============================
export default function ModalsContainer({
  showAddModal,
  setShowAddModal,
  showTransferModal,
  setShowTransferModal,
  showTransferSuccess,
  setShowTransferSuccess,
  assetPendingDelete,
  setAssetPendingDelete,
  qrAsset,
  setQrAsset,
  showPhysicalTransfer,
  setShowPhysicalTransfer,
  onAddAsset,
  onEditAsset,
  editAsset,
  setEditAsset,
  onDeleteConfirm,
  onDeleteCancel,
  onTransfer,
  assets,
  selectedAssetIds,
  nameOptions,
  categoryOptions,
  locationOptions,
  statusOptions,
  newLocation,
  setNewLocation
}) {
  // ==============================
  // NOTE — ID HANDLING
  // ==============================
  // We now treat selectedAssetIds as string IDs throughout.
  // Remove integer conversion to allow for IDs like "PPC045162".

  // ==============================
  // RENDER
  // ==============================
  return (
    <>
      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={onAddAsset}
        nameOptions={nameOptions}
        categoryOptions={categoryOptions}
        locationOptions={locationOptions}
        statusOptions={statusOptions}
      />
      <EditAssetModal
        isOpen={!!editAsset}
        initialData={editAsset}
        onClose={() => setEditAsset(null)}
        onSave={onEditAsset}
        nameOptions={nameOptions}
        categoryOptions={categoryOptions}
        locationOptions={locationOptions}
        statusOptions={statusOptions}
        buttonColor='#6a7257'
      />
      <TransferModal
        isOpen={showTransferModal}
        selectedCount={selectedAssetIds ? selectedAssetIds.length : 0}
        selectedIds={selectedAssetIds || []}
        onClose={() => setShowTransferModal(false)}
        locationOptions={locationOptions}
        newLocation={newLocation}
        onLocationChange={setNewLocation}
        onTransfer={onTransfer}
        searchableAssets={assets}
      />
      <TransferSuccessModal
        isOpen={showTransferSuccess}
        transferredIds={selectedAssetIds || []}
        onClose={() => setShowTransferSuccess(false)}
      />
      <ConfirmDeleteModal
        isOpen={Boolean(assetPendingDelete)}
        asset={assetPendingDelete || {}}
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
      <PalomaQRCodeModal
        asset={qrAsset}
        open={!!qrAsset}
        onClose={() => setQrAsset(null)}
      />
      <PhysicalAssetTransferModal
        isOpen={showPhysicalTransfer}
        assets={assets}
        selectedAssets={selectedAssetIds || []}
        onClose={() => setShowPhysicalTransfer(false)}
      />
    </>
  );
}
