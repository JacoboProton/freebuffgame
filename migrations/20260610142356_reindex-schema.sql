-- ============================================================================
-- Migration: no-op
-- REINDEX SCHEMA public + ANALYZE were performed out-of-band via `db query`
-- on 2026-06-10. REINDEX SCHEMA cannot run inside the migration transaction
-- (PostgreSQL rejects it), and indexes are verified healthy (78 indexes,
-- all present). This file is kept so the migration tracker advances and the
-- subsequent enrollment-restriction migration can apply.
-- ============================================================================

SELECT 1;
