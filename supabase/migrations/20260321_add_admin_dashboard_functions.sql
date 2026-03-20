-- ============================================
-- ADMIN DASHBOARD STATISTICS FUNCTIONS
-- ============================================
-- Purpose: Provide real-time database statistics for admin dashboard
-- Created: March 20, 2026
-- ============================================

-- Function to get table sizes and row counts
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name TEXT,
  total_size TEXT,
  data_size TEXT,
  index_size TEXT,
  row_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)))::TEXT,
    pg_size_pretty(pg_relation_size(quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)))::TEXT,
    pg_size_pretty(pg_indexes_size(quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)))::TEXT,
    COALESCE(ps.n_live_tup, 0)::BIGINT
  FROM information_schema.tables t
  LEFT JOIN pg_stat_user_tables ps ON t.table_name = ps.relname
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY pg_total_relation_size(quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_stats()
RETURNS TABLE (
  tablename TEXT,
  indexname TEXT,
  index_size TEXT,
  idx_scan BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.tablename::TEXT,
    pi.indexname::TEXT,
    pg_size_pretty(pg_relation_size(pi.indexrelid))::TEXT,
    ps.idx_scan::BIGINT
  FROM pg_indexes pi
  JOIN pg_stat_user_indexes ps ON pi.indexname = ps.indexrelname
  WHERE pi.schemaname = 'public'
  ORDER BY ps.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get cache hit ratio
CREATE OR REPLACE FUNCTION get_cache_hit_ratio()
RETURNS TABLE (
  ratio DECIMAL,
  heap_blks_hit BIGINT,
  heap_blks_read BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN sum(heap_blks_hit) + sum(heap_blks_read) = 0 THEN 0
      ELSE (sum(heap_blks_hit)::DECIMAL / (sum(heap_blks_hit) + sum(heap_blks_read))) 
    END::DECIMAL,
    sum(heap_blks_hit)::BIGINT,
    sum(heap_blks_read)::BIGINT
  FROM pg_statio_user_tables;
END;
$$ LANGUAGE plpgsql;

-- Function to get database size
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS TABLE (
  total_size TEXT,
  total_bytes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_size_pretty(sum(pg_total_relation_size(relid)))::TEXT,
    sum(pg_total_relation_size(relid))::BIGINT
  FROM pg_catalog.pg_statio_user_tables
  WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- Function to get system metrics
CREATE OR REPLACE FUNCTION get_system_metrics()
RETURNS TABLE (
  uptime TEXT,
  active_connections INTEGER,
  total_queries BIGINT,
  slow_queries BIGINT,
  dead_tuples BIGINT,
  last_vacuum TEXT,
  last_analyze TEXT
) AS $$
DECLARE
  uptime_interval INTERVAL;
  uptime_text TEXT;
BEGIN
  -- Get uptime
  SELECT date_trunc('second', now() - pg_postmaster_start_time()) INTO uptime_interval;
  uptime_text := uptime_interval::TEXT;
  
  RETURN QUERY
  SELECT 
    uptime_text::TEXT,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::INTEGER,
    (SELECT sum(numbackends) FROM pg_stat_database WHERE datname = current_database())::BIGINT,
    0::BIGINT, -- Slow queries would require pg_stat_statements extension
    (SELECT COALESCE(sum(n_dead_tup), 0) FROM pg_stat_user_tables)::BIGINT,
    (SELECT COALESCE(date_trunc('minute', max(last_vacuum)), 'Never')::TEXT FROM pg_stat_user_tables),
    (SELECT COALESCE(date_trunc('minute', max(last_analyze)), 'Never')::TEXT FROM pg_stat_user_tables);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_sizes() TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_hit_ratio() TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_size() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_metrics() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_table_sizes IS 'Returns storage statistics for all public tables';
COMMENT ON FUNCTION get_index_stats IS 'Returns usage statistics for all indexes';
COMMENT ON FUNCTION get_cache_hit_ratio IS 'Returns database cache hit ratio (should be > 0.95)';
COMMENT ON FUNCTION get_database_size IS 'Returns total database size';
COMMENT ON FUNCTION get_system_metrics IS 'Returns system health metrics including uptime and connections';
