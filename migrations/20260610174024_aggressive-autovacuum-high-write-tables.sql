-- ============================================================================
-- Aggressive autovacuum tuning for the four highest-write public tables
-- ============================================================================
-- User, Enrollment, LessonProgress, and GameScore receive the bulk of the
-- app's DML (signups, course enrollments, lesson completions, leaderboard
-- scores). At default settings (scale_factor=0.2, threshold=50), autovacuum
-- only triggers after 20% of the table is dead tuples — fine for catalog
-- tables, but on these hot tables that lets bloat accumulate during traffic
-- spikes.
--
-- Tuning rationale:
--   * scale_factor 0.2 -> 0.02  (10x more aggressive trigger)
--   * threshold 50 stays as a floor so very small tables still get vacuumed
--     even when 2% of rows is < 1 tuple
--   * insert_scale_factor 0.02 (Postgres 13+) catches insert-driven bloat
--     too, important for the User table on signup waves
--   * cost_limit 200 -> 400 lets the worker do twice the work per cycle
--   * analyze follows the same lowered threshold so the planner's stats
--     stay fresh after every meaningful DML burst
--
-- Rollback: ALTER TABLE ... RESET (autovacuum_vacuum_scale_factor, ...)
-- ============================================================================

ALTER TABLE "User" SET (
  autovacuum_vacuum_scale_factor      = 0.02,
  autovacuum_vacuum_threshold         = 50,
  autovacuum_analyze_scale_factor     = 0.02,
  autovacuum_analyze_threshold        = 50,
  autovacuum_vacuum_insert_scale_factor = 0.02,
  autovacuum_vacuum_cost_limit        = 400
);

ALTER TABLE "Enrollment" SET (
  autovacuum_vacuum_scale_factor      = 0.02,
  autovacuum_vacuum_threshold         = 50,
  autovacuum_analyze_scale_factor     = 0.02,
  autovacuum_analyze_threshold        = 50,
  autovacuum_vacuum_cost_limit        = 400
);

ALTER TABLE "LessonProgress" SET (
  autovacuum_vacuum_scale_factor      = 0.02,
  autovacuum_vacuum_threshold         = 50,
  autovacuum_analyze_scale_factor     = 0.02,
  autovacuum_analyze_threshold        = 50,
  autovacuum_vacuum_cost_limit        = 400
);

ALTER TABLE "GameScore" SET (
  autovacuum_vacuum_scale_factor      = 0.02,
  autovacuum_vacuum_threshold         = 50,
  autovacuum_analyze_scale_factor     = 0.02,
  autovacuum_analyze_threshold        = 50,
  autovacuum_vacuum_insert_scale_factor = 0.02,
  autovacuum_vacuum_cost_limit        = 400
);
