const express = require('express');
const router = express.Router();
const tenderService = require('../services/tenderService');
const cacheMiddleware = require('../middleware/cache');

/**
 * GET /api/tenders
 * Lists tenders with filters and caching.
 */
router.get('/', cacheMiddleware, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      work_area: req.query.work_area,
      q: req.query.q
    };
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await tenderService.getTenders(filters, limit, offset);
    res.json(result);
  } catch (err) {
    console.error('Error fetching tenders:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/tenders/:tender_no
 * Fetches a specific tender by number.
 */
router.get('/:tender_no', cacheMiddleware, async (req, res) => {
  try {
    const tender = await tenderService.getTenderByNo(req.params.tender_no);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    res.json(tender);
  } catch (err) {
    console.error('Error fetching tender:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/tenders
 * Upserts tender data (used by internal scrapers/parsers).
 */
router.post('/', async (req, res) => {
  try {
    const tender = await tenderService.upsertTender(req.body);
    res.status(201).json(tender);
  } catch (err) {
    console.error('Error upserting tender:', err);
    res.status(400).json({ error: 'Failed to process tender data' });
  }
});

module.exports = router;
