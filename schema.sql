-- IREPS Tenders Table Schema
-- Partitioning by due_at can be implemented as the volume grows.

CREATE TABLE IF NOT EXISTS tenders (
    id          BIGSERIAL PRIMARY KEY,
    tender_no   VARCHAR(50) NOT NULL UNIQUE,
    department  TEXT NOT NULL,
    title       TEXT NOT NULL,
    status      VARCHAR(30) NOT NULL DEFAULT 'Published',
    work_area   VARCHAR(50),
    due_at      TIMESTAMPTZ,
    due_days    VARCHAR(20),
    pdf_link    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders (status);
CREATE INDEX IF NOT EXISTS idx_tenders_due_at ON tenders (due_at);
CREATE INDEX IF NOT EXISTS idx_tenders_active ON tenders (due_at) WHERE status = 'Published';
CREATE INDEX IF NOT EXISTS idx_tenders_title_fts ON tenders USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_tenders_work_area ON tenders (work_area);
