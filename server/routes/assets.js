const express = require('express');
const router = express.Router();
const assetService = require('../services/assets');

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const assets = status
      ? await assetService.getAssetsByStatus(status)
      : await assetService.getAllAssets();
    res.json(assets);
  } catch (err) {
    console.error('Failed to get assets:', err);
    res.status(500).json({ error: 'Failed to load assets' });
  }
});

// POST /api/assets
router.post('/', async (req, res) => {
  try {
    const discordUser = req.user?.username || 'Unknown User';
    const asset = await assetService.addAsset(req.body, discordUser);
    await assetService.addActivityLog({
      action: 'Added Asset',
      asset_id: asset.id,
      details: JSON.stringify(req.body),
      user: discordUser,
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Failed to add asset:', err);
    res.status(500).json({ error: 'Failed to add asset' });
  }
});

// PUT /api/assets/:id
router.put('/:id', async (req, res) => {
  try {
    const assetId = req.params.id;
    const discordUser = req.user?.username || 'Unknown User';
    const result = await assetService.updateAsset(assetId, req.body, discordUser);
    await assetService.addActivityLog({
      action: 'Updated Asset',
      asset_id: assetId,
      details: JSON.stringify(req.body),
      user: discordUser,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update asset:', err);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    const assetId = req.params.id;
    const discordUser = req.user?.username || 'Unknown User';
    const asset = await assetService.getAssetById(assetId);
    const deleted = await assetService.deleteAsset(assetId, discordUser);
    await assetService.addActivityLog({
      action: 'Deleted Asset',
      asset_id: assetId,
      details: JSON.stringify(asset),
      user: discordUser,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete asset:', err);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// POST /api/assets/transfer
router.post('/transfer', async (req, res) => {
  try {
    const { assetIds, newLocation } = req.body;
    if (!Array.isArray(assetIds) || !newLocation) {
      return res.status(400).json({ error: 'Must provide assetIds array and newLocation.' });
    }
    const discordUser = req.user?.username || 'Unknown User';
    await assetService.transferMultipleAssets(assetIds, newLocation, discordUser);
    await assetService.addActivityLog({
      action: 'Transferred Multiple Assets',
      asset_id: assetIds.length === 1 ? assetIds[0] : assetIds.join(', '),
      details: JSON.stringify({ items: assetIds, newLocation }),
      user: discordUser,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('TRANSFER ERROR (api/assets/transfer):', err.stack || err);
    res.status(500).json({ error: 'Failed to transfer multiple assets', detail: err.message });
  }
});

module.exports = router;
