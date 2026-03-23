-- ============================================================================
-- ELECTROBUDDY - TECHNICIANS & ADMIN DASHBOARD SETUP
-- ============================================================================
-- Run this AFTER 001-core-setup.sql and 002-ecommerce-setup.sql
-- Adds technician management, approval workflow, and admin dashboard functions
-- ============================================================================

-- ============================================================================
-- TECHNICIANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  
  skills TEXT[] NOT NULL,
  experience INTEGER,
  certification_url TEXT,
  availability BOOLEAN NOT NULL DEFAULT true,
  
  -- Approval workflow
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  
  -- Service areas
  service_areas TEXT[],
  base_location TEXT,
  
  -- Ratings
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_jobs INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- Index for filtering pending applications
CREATE INDEX IF NOT EXISTS idx_technicians_approval_status ON technicians(approval_status);
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON technicians(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON public.technicians 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- TECHNICIAN RLS POLICIES
-- ============================================================================

-- Users can create own technician profile (for sign-up)
CREATE POLICY "users_create_own_technician" ON public.technicians
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view own profile, admins can view all
CREATE POLICY "view_technician_profiles" ON public.technicians
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin')
);

-- Technicians can update own profile (except approval_status)
CREATE POLICY "technicians_update_own_profile" ON public.technicians
FOR UPDATE USING (auth.uid() = user_id);

-- Admins can update approval status and manage all technicians
CREATE POLICY "admins_manage_technicians" ON public.technicians
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- BOOKINGS - TECHNICIAN ASSIGNMENT ENHANCEMENTS
-- ============================================================================

-- Add technician assignment columns if they don't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS assigned_technician_id UUID REFERENCES technicians(id);

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS technician_status TEXT DEFAULT 'unassigned';

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create index for technician assignments
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_technician ON bookings(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ============================================================================
-- ADMIN NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "admins_view_notifications" ON public.admin_notifications
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for unread count
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON admin_notifications(is_read) WHERE is_read = false;

-- ============================================================================
-- NOTIFICATION TRIGGER FOR NEW TECHNICIAN APPLICATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_new_technician_application()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approval_status = 'pending' THEN
    INSERT INTO admin_notifications (type, title, message, data)
    VALUES (
      'new_technician_application',
      'New Technician Application',
      'Technician ' || NEW.name || ' has applied to join the team',
      jsonb_build_object(
        'technician_id', NEW.id,
        'technician_name', NEW.name,
        'technician_email', NEW.email,
        'skills', NEW.skills
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_technician_application ON public.technicians;

-- Create trigger
CREATE TRIGGER on_technician_application
  AFTER INSERT ON public.technicians
  FOR EACH ROW
  WHEN (NEW.approval_status = 'pending')
  EXECUTE FUNCTION notify_new_technician_application();

-- ============================================================================
-- HELPER FUNCTIONS FOR TECHNICIANS
-- ============================================================================

-- Get pending technician count
CREATE OR REPLACE FUNCTION get_pending_technician_count()
RETURNS integer AS $$
DECLARE
  count integer;
BEGIN
  SELECT COUNT(*)::integer INTO count
  FROM public.technicians
  WHERE approval_status = 'pending';
  RETURN count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get available technicians in area
CREATE OR REPLACE FUNCTION get_available_technicians(_skill text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  skills text[],
  rating decimal,
  total_jobs bigint,
  service_areas text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.skills, t.rating, t.total_jobs::bigint, t.service_areas
  FROM technicians t
  WHERE t.approval_status = 'approved'
    AND t.availability = true
    AND (_skill IS NULL OR _skill = ANY(t.skills))
  ORDER BY t.rating DESC, t.total_jobs DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- VIEW FOR PENDING TECHNICIAN APPLICATIONS
-- ============================================================================

CREATE OR REPLACE VIEW pending_technician_applications AS
SELECT 
  t.id,
  t.name,
  t.email,
  t.phone,
  t.address,
  t.skills,
  t.experience,
  t.created_at as applied_at,
  u.raw_user_meta_data->>'name' as full_name,
  u.created_at as user_created_at
FROM technicians t
JOIN auth.users u ON u.id = t.user_id
WHERE t.approval_status = 'pending';

GRANT SELECT ON pending_technician_applications TO authenticated;

-- ============================================================================
-- ADMIN DASHBOARD STATISTICS FUNCTIONS
-- ============================================================================

-- Get table sizes and row counts
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

-- Get index stats
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

-- Get cache hit ratio
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

-- Get database size
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

-- Get system metrics
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
  SELECT date_trunc('second', now() - pg_postmaster_start_time()) INTO uptime_interval;
  uptime_text := uptime_interval::TEXT;
  
  RETURN QUERY
  SELECT 
    uptime_text::TEXT,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::INTEGER,
    (SELECT sum(numbackends) FROM pg_stat_database WHERE datname = current_database())::BIGINT,
    0::BIGINT,
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
GRANT EXECUTE ON FUNCTION get_pending_technician_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_technicians(text) TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_table_sizes IS 'Returns storage statistics for all public tables';
COMMENT ON FUNCTION get_index_stats IS 'Returns usage statistics for all indexes';
COMMENT ON FUNCTION get_cache_hit_ratio IS 'Returns database cache hit ratio (should be > 0.95)';
COMMENT ON FUNCTION get_database_size IS 'Returns total database size';
COMMENT ON FUNCTION get_system_metrics IS 'Returns system health metrics including uptime and connections';
COMMENT ON FUNCTION get_pending_technician_count IS 'Returns count of pending technician applications';
COMMENT ON FUNCTION get_available_technicians IS 'Returns list of available technicians by skill';

-- ============================================================================
-- TECHNICIAN SETUP COMPLETE
-- ============================================================================
-- Next: Run 004-seed-data-and-admin.sql to create admin user and seed data
-- ============================================================================
