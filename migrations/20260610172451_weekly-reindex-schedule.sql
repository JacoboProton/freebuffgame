-- ============================================================================
-- Weekly REINDEX INDEX CONCURRENTLY for the public schema
-- ============================================================================
-- PostgreSQL does not allow multiple REINDEX INDEX CONCURRENTLY statements in a
-- single transaction. pg_cron runs each scheduled job in its own session with
-- autocommit on, so we schedule *one single-statement* cron job per index,
-- staggered 1 minute apart. This keeps the lock-free property of
-- REINDEX CONCURRENTLY while distributing the work over ~78 minutes.
--
-- Mechanics:
--   - The orchestrator reindex_public_schema() reads pg_indexes and, for each
--     real index, schedules a job at NOW() + N minutes (using 5-field cron
--     `M H * * *` with M and H derived from the target time).
--   - Each scheduled job fires once, runs REINDEX INDEX CONCURRENTLY, then
--     unschedules itself via _reindex_one_and_unschedule(). Result: a true
--     one-shot that leaves no cron.job rows behind.
--   - On startup the orchestrator also defensively deletes any leftover
--     reindex_* jobs from previous runs.
--
-- The companion weekly job `weekly_reindex_public_schema` invokes the
-- orchestrator every Sunday at 03:00 UTC. To run it manually:
--   SELECT * FROM public.reindex_public_schema();
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: run REINDEX on a single index, then unschedule the cron job.
-- Idempotent — safe to call by hand. Unschedule happens even on failure.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._reindex_one_and_unschedule(
  p_jobname    text,
  p_indexname  text
)
RETURNS void
LANGUAGE plpgsql
AS $fn$
BEGIN
  EXECUTE format('REINDEX INDEX CONCURRENTLY %I;', p_indexname);
  PERFORM cron.unschedule(p_jobname);
EXCEPTION WHEN OTHERS THEN
  BEGIN
    PERFORM cron.unschedule(p_jobname);
  EXCEPTION WHEN OTHERS THEN
    NULL;  -- already gone
  END;
  RAISE;
END;
$fn$;

COMMENT ON FUNCTION public._reindex_one_and_unschedule(text, text) IS
  'Internal helper: reindex a single index, then unschedule the calling cron job.';

-- ---------------------------------------------------------------------------
-- Orchestrator: schedule one-shot reindex jobs for every public index.
-- Returns the count of jobs scheduled and the batch id.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reindex_public_schema()
RETURNS TABLE (scheduled_count integer, batch_id text, total_runtime_minutes integer)
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_batch_id     TEXT := to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDDHH24MISS');
  v_idx          RECORD;
  v_idx_no       INT  := 0;
  v_target_time  TIMESTAMPTZ;
  v_minute_part  INT;
  v_hour_part    INT;
  v_jobname      TEXT;
  v_cleaned      INT;
BEGIN
  -- 1. Defensive cleanup of leftover jobs from previous runs.
  DELETE FROM cron.job WHERE jobname ~ '^reindex_[0-9]{14}_[0-9]+$';
  GET DIAGNOSTICS v_cleaned = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % leftover reindex_* cron job(s)', v_cleaned;

  -- 2. Schedule one one-shot reindex per public index, staggered 1 minute.
  --    Skip *_ccnew / *_ccold artifacts left by aborted concurrent reindexes.
  FOR v_idx IN
    SELECT i.indexname
      FROM pg_indexes i
     WHERE i.schemaname = 'public'
       AND i.indexname NOT LIKE '%ccnew'
       AND i.indexname NOT LIKE '%ccold'
     ORDER BY i.indexname
  LOOP
    v_idx_no      := v_idx_no + 1;
    v_target_time := date_trunc('minute', now()) + (v_idx_no * interval '1 minute');
    v_minute_part := EXTRACT(MINUTE FROM v_target_time)::INT % 60;
    v_hour_part   := (EXTRACT(EPOCH FROM v_target_time)::BIGINT / 3600) % 24;
    v_jobname     := 'reindex_' || v_batch_id || '_' || lpad(v_idx_no::text, 3, '0');

    PERFORM cron.schedule(
      v_jobname,
      format('%s %s * * *', v_minute_part, v_hour_part),
      format(
        'SELECT public._reindex_one_and_unschedule(%L, %L);',
        v_jobname, v_idx.indexname
      )
    );
  END LOOP;

  scheduled_count       := v_idx_no;
  batch_id              := v_batch_id;
  total_runtime_minutes := v_idx_no;
  RETURN NEXT;

  RAISE NOTICE 'Scheduled % one-shot REINDEX jobs (batch %), spaced 1 min apart',
               v_idx_no, v_batch_id;
END;
$fn$;

COMMENT ON FUNCTION public.reindex_public_schema() IS
  'Orchestrator: schedules one-shot, lock-free REINDEX INDEX CONCURRENTLY jobs for every public index, staggered 1 minute apart. Designed to be invoked weekly by pg_cron; safe to call manually.';
