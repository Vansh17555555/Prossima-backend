const { readPool, writePool } = require('../lib/db');

/**
 * Service to handle IRPS Tender data operations.
 */
const tenderService = {
  /**
   * Fetches all tenders with optional filters and pagination.
   * Uses readPool strictly.
   */
  async getTenders(filters = {}, limit = 50, offset = 0) {
    const { status, work_area, q } = filters;
    let baseQuery = ' FROM tenders WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      baseQuery += ` AND status = $${params.length}`;
    }
    if (work_area) {
      params.push(work_area);
      baseQuery += ` AND work_area = $${params.length}`;
    }
    if (q) {
      params.push(`%${q}%`);
      baseQuery += ` AND (tender_no ILIKE $${params.length} OR department ILIKE $${params.length} OR title ILIKE $${params.length})`;
    }

    // Get total count for these filters
    const countQuery = `SELECT COUNT(*) as total` + baseQuery;
    const countResult = await readPool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated rows
    const dataQuery = `SELECT * ` + baseQuery + ` ORDER BY due_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await readPool.query(dataQuery, params);
    return {
      tenders: result.rows,
      total,
      limit,
      offset
    };
  },

  /**
   * Fetches a single tender by its tender_no.
   * Uses readPool strictly.
   */
  async getTenderByNo(tenderNo) {
    const query = 'SELECT * FROM tenders WHERE tender_no = $1';
    const result = await readPool.query(query, [tenderNo]);
    return result.rows[0];
  },

  /**
   * Upserts a tender record. 
   * Uses writePool strictly.
   */
  async upsertTender(tenderData) {
    const {
      tender_no, department, title, status = 'Published', 
      work_area, due_at, due_days, pdf_link
    } = tenderData;

    const query = `
      INSERT INTO tenders (
        tender_no, department, title, status, work_area, due_at, due_days, pdf_link, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (tender_no, department) DO UPDATE SET
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        work_area = EXCLUDED.work_area,
        due_at = EXCLUDED.due_at,
        due_days = EXCLUDED.due_days,
        pdf_link = EXCLUDED.pdf_link,
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await writePool.query(query, [
      tender_no, department, title, status, work_area, due_at, due_days, pdf_link
    ]);

    return result.rows[0];
  }
};

module.exports = tenderService;
