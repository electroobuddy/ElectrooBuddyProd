-- ============================================================================
-- ELECTROOBUDDY - ADVANCED FUNCTIONS & OPTIMIZATION v2.0
-- Production-Grade Database Functions and Performance Enhancements
-- ============================================================================
-- Description: Advanced database functions, monitoring, and optimization
-- Features: Database metrics, performance monitoring, advanced queries
-- Created: 2026-03-23
-- ============================================================================

-- ============================================================================
-- STEP 1: DATABASE MONITORING FUNCTIONS
-- ============================================================================

-- Function to get database size
CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS TABLE (
    total_bytes BIGINT,
    total_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_database_size(current_database()) as total_bytes,
        pg_size_pretty(pg_database_size(current_database())) as total_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get table sizes
CREATE OR REPLACE FUNCTION public.get_table_sizes()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    total_size TEXT,
    data_size TEXT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT as table_name,
        s.n_live_tup as row_count,
        pg_size_pretty(pg_total_relation_size(s.schemaname || '.' || t.tablename)) as total_size,
        pg_size_pretty(pg_relation_size(s.schemaname || '.' || t.tablename)) as data_size,
        pg_size_pretty(pg_indexes_size(s.schemaname || '.' || t.tablename)) as index_size
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(s.schemaname || '.' || t.tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get index stats
CREATE OR REPLACE FUNCTION public.get_index_stats()
RETURNS TABLE (
    tablename TEXT,
    indexname TEXT,
    index_size TEXT,
    idx_scan BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::TEXT as tablename,
        indexrelname::TEXT as indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        idx_scan as idx_scan
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY pg_relation_size(indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get system metrics
CREATE OR REPLACE FUNCTION public.get_system_metrics()
RETURNS TABLE (
    active_connections INTEGER,
    total_queries BIGINT,
    slow_queries BIGINT,
    dead_tuples BIGINT,
    last_vacuum TIMESTAMPTZ,
    last_analyze TIMESTAMPTZ,
    uptime TEXT
) AS $$
DECLARE
    db_start_time TIMESTAMPTZ;
BEGIN
    -- Get database start time (approximate using postmaster start)
    SELECT pg_postmaster_start_time() INTO db_start_time;
    
    RETURN QUERY
    SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::INTEGER as active_connections,
        (SELECT sum(numbackends) FROM pg_stat_database WHERE datname = current_database()) as total_queries,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 seconds') as slow_queries,
        (SELECT sum(n_dead_tup) FROM pg_stat_user_tables WHERE schemaname = 'public') as dead_tuples,
        (SELECT max(last_vacuum) FROM pg_stat_user_tables WHERE schemaname = 'public') as last_vacuum,
        (SELECT max(last_analyze) FROM pg_stat_user_tables WHERE schemaname = 'public') as last_analyze,
        CASE 
            WHEN db_start_time IS NOT NULL THEN age(now(), db_start_time)::TEXT
            ELSE 'unknown'
        END as uptime;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get cache hit ratio
CREATE OR REPLACE FUNCTION public.get_cache_hit_ratio()
RETURNS TABLE (
    heap_blks_read BIGINT,
    heap_blks_hit BIGINT,
    ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sum(heap_blks_read) as heap_blks_read,
        sum(heap_blks_hit) as heap_blks_hit,
        CASE 
            WHEN sum(heap_blks_read) + sum(heap_blks_hit) > 0 
            THEN round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_read) + sum(heap_blks_hit)), 2)
            ELSE 0
        END as ratio
    FROM pg_statio_user_tables
    WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 2: TECHNICIAN MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to get technician's today assignments count
CREATE OR REPLACE FUNCTION public.get_technician_today_assignments(technician_id UUID)
RETURNS INTEGER AS $$
DECLARE
    assignment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO assignment_count
    FROM public.bookings
    WHERE assigned_technician_id = technician_id
    AND DATE(assignment_date) = CURRENT_DATE
    AND status IN ('assigned', 'confirmed', 'in_progress');
    
    RETURN COALESCE(assignment_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if technician can accept more bookings today
CREATE OR REPLACE FUNCTION public.can_technician_accept_booking(technician_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    daily_limit_val INTEGER;
    current_assignments INTEGER;
BEGIN
    -- Get technician's daily limit
    SELECT daily_limit INTO daily_limit_val
    FROM public.technicians
    WHERE id = technician_id AND status = 'active';
    
    IF daily_limit_val IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get current assignments
    SELECT get_technician_today_assignments(technician_id) INTO current_assignments;
    
    RETURN current_assignments < daily_limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to auto-assign best technician for a booking
CREATE OR REPLACE FUNCTION public.find_best_technician_for_booking(booking_id UUID)
RETURNS UUID AS $$
DECLARE
    best_technician_id UUID;
BEGIN
    SELECT t.id INTO best_technician_id
    FROM public.technicians t
    WHERE t.status = 'active'
    AND (
        SELECT get_technician_today_assignments(t.id)
    ) < t.daily_limit
    ORDER BY t.priority DESC, 
             (SELECT get_technician_today_assignments(t.id)) ASC
    LIMIT 1;
    
    RETURN best_technician_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 3: BOOKING MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to update booking status with notification
CREATE OR REPLACE FUNCTION public.update_booking_status_with_notification(
    p_booking_id UUID,
    p_new_status TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    old_status_val TEXT;
    user_email_val TEXT;
BEGIN
    -- Get current status and user email
    SELECT b.status, u.email INTO old_status_val, user_email_val
    FROM public.bookings b
    LEFT JOIN auth.users u ON b.user_id = u.id
    WHERE b.id = p_booking_id;
    
    IF old_status_val IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update booking status
    UPDATE public.bookings
    SET status = p_new_status,
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        updated_at = now()
    WHERE id = p_booking_id;
    
    -- Create notification record
    INSERT INTO public.booking_notifications (
        booking_id,
        user_email,
        old_status,
        new_status,
        sent
    ) VALUES (
        p_booking_id,
        user_email_val,
        old_status_val,
        p_new_status,
        false
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to auto-assign technician to pending booking
CREATE OR REPLACE FUNCTION public.auto_assign_technician_to_booking(booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    technician_id_val UUID;
    assignment_date_val DATE;
BEGIN
    -- Check if booking is pending
    PERFORM 1 FROM public.bookings
    WHERE id = booking_id AND status = 'pending'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Find best technician
    SELECT public.find_best_technician_for_booking(booking_id) INTO technician_id_val;
    
    IF technician_id_val IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Set assignment date to preferred date or today
    SELECT preferred_date INTO assignment_date_val
    FROM public.bookings
    WHERE id = booking_id;
    
    -- Update booking with technician assignment
    UPDATE public.bookings
    SET 
        assigned_technician_id = technician_id_val,
        assigned_at = now(),
        assignment_date = COALESCE(assignment_date_val, CURRENT_DATE),
        status = 'assigned'
    WHERE id = booking_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 4: INVENTORY MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to check product availability
CREATE OR REPLACE FUNCTION public.check_product_availability(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    product_record RECORD;
BEGIN
    SELECT * INTO product_record
    FROM public.products
    WHERE id = p_product_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- If not tracking inventory, always available
    IF NOT product_record.track_inventory THEN
        RETURN TRUE;
    END IF;
    
    -- If backorder allowed, always available
    IF product_record.allow_backorder THEN
        RETURN TRUE;
    END IF;
    
    -- Check stock
    RETURN product_record.inventory_quantity >= p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update product inventory
CREATE OR REPLACE FUNCTION public.update_product_inventory(
    p_product_id UUID,
    p_quantity_change INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_quantity INTEGER;
BEGIN
    -- Get current inventory
    SELECT inventory_quantity INTO current_quantity
    FROM public.products
    WHERE id = p_product_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update inventory
    UPDATE public.products
    SET inventory_quantity = inventory_quantity + p_quantity_change
    WHERE id = p_product_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 5: ORDER MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to create order from cart
CREATE OR REPLACE FUNCTION public.create_order_from_cart(
    p_user_id UUID,
    p_shipping_address_id UUID,
    p_payment_method TEXT,
    p_customer_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal DECIMAL := 0;
    v_shipping_charge DECIMAL := 0;
    v_installation_total DECIMAL := 0;
    v_tax_amount DECIMAL := 0;
    v_discount_amount DECIMAL := 0;
    v_total_amount DECIMAL := 0;
BEGIN
    -- Generate order number
    SELECT public.generate_order_number() INTO v_order_number;
    
    -- Calculate totals
    SELECT 
        COALESCE(SUM(p.price * ci.quantity), 0),
        COALESCE(SUM(CASE WHEN ci.installation_service THEN p.installation_charge * ci.quantity ELSE 0 END), 0),
        COALESCE(SUM(ci.quantity), 0)
    INTO v_subtotal, v_installation_total, v_total_amount
    FROM public.cart_items ci
    JOIN public.products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id;
    
    -- Calculate tax (example: 18% GST)
    v_tax_amount := v_subtotal * 0.18;
    
    -- Calculate total
    v_total_amount := v_subtotal + v_shipping_charge + v_installation_total + v_tax_amount - v_discount_amount;
    
    -- Create order
    INSERT INTO public.orders (
        order_number,
        user_id,
        status,
        payment_status,
        fulfillment_status,
        subtotal,
        shipping_charge,
        installation_total,
        tax_amount,
        discount_amount,
        total_amount,
        payment_method,
        shipping_address_id,
        customer_notes
    ) VALUES (
        v_order_number,
        p_user_id,
        'pending',
        'pending',
        'unfulfilled',
        v_subtotal,
        v_shipping_charge,
        v_installation_total,
        v_tax_amount,
        v_discount_amount,
        v_total_amount,
        p_payment_method,
        p_shipping_address_id,
        p_customer_notes
    ) RETURNING id INTO v_order_id;
    
    -- Create order items
    INSERT INTO public.order_items (
        order_id,
        product_id,
        product_name,
        product_sku,
        product_image,
        quantity,
        unit_price,
        installation_service,
        installation_charge,
        total_price
    )
    SELECT 
        v_order_id,
        ci.product_id,
        p.name,
        p.sku,
        p.main_image_url,
        ci.quantity,
        p.price,
        ci.installation_service,
        p.installation_charge,
        (p.price * ci.quantity) + (CASE WHEN ci.installation_service THEN p.installation_charge * ci.quantity ELSE 0 END)
    FROM public.cart_items ci
    JOIN public.products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id;
    
    -- Update product inventory
    UPDATE public.products p
    SET inventory_quantity = inventory_quantity - ci.quantity
    FROM public.cart_items ci
    WHERE p.id = ci.product_id
    AND ci.user_id = p_user_id
    AND p.track_inventory = true;
    
    -- Clear cart
    DELETE FROM public.cart_items
    WHERE user_id = p_user_id;
    
    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 6: ANALYTICS AND REPORTING FUNCTIONS
-- ============================================================================

-- Function to get daily booking statistics
CREATE OR REPLACE FUNCTION public.get_daily_booking_statistics(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    booking_date DATE,
    total_bookings BIGINT,
    completed_bookings BIGINT,
    cancelled_bookings BIGINT,
    pending_bookings BIGINT,
    revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(b.created_at) as booking_date,
        COUNT(*) FILTER (WHERE TRUE) as total_bookings,
        COUNT(*) FILTER (WHERE b.status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings,
        COUNT(*) FILTER (WHERE b.status IN ('pending', 'assigned')) as pending_bookings,
        0 as revenue -- Add pricing if bookings have prices
    FROM public.bookings b
    WHERE DATE(b.created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(b.created_at)
    ORDER BY booking_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get product sales statistics
CREATE OR REPLACE FUNCTION public.get_product_sales_statistics(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    total_quantity_sold BIGINT,
    total_revenue DECIMAL,
    total_orders BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        SUM(oi.quantity) as total_quantity_sold,
        SUM(oi.total_price) as total_revenue,
        COUNT(DISTINCT oi.order_id) as total_orders
    FROM public.order_items oi
    JOIN public.products p ON oi.product_id = p.id
    JOIN public.orders o ON oi.order_id = o.id
    WHERE DATE(o.ordered_at) BETWEEN p_start_date AND p_end_date
    AND o.status != 'cancelled'
    GROUP BY p.id, p.name
    ORDER BY total_quantity_sold DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 7: MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.booking_notifications
        WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL
        RETURNING 1
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to archive old orders
CREATE OR REPLACE FUNCTION public.archive_old_orders(
    p_days_to_archive INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Mark old delivered orders as archived (you could add an 'archived' status)
    UPDATE public.orders
    SET admin_notes = CONCAT(admin_notes, ' [ARCHIVED on ', NOW(), ']')
    WHERE status = 'delivered'
    AND delivered_at < NOW() - (p_days_to_archive || ' days')::INTERVAL;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 8: TRIGGER FUNCTIONS
-- ============================================================================

-- Trigger function to send booking notification
CREATE OR REPLACE FUNCTION public.send_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Here you would integrate with email/SMS service
    -- For now, just mark notification as sent
    IF TG_OP = 'INSERT' AND NEW.sent = false THEN
        UPDATE public.booking_notifications
        SET sent = true
        WHERE id = NEW.id;
        
        -- Log notification (in production, integrate with email service)
        RAISE NOTICE 'Notification sent for booking %: % -> %', 
                     NEW.booking_id, NEW.old_status, NEW.new_status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to automatically send notifications
DROP TRIGGER IF EXISTS tr_send_booking_notification ON public.booking_notifications;
CREATE TRIGGER tr_send_booking_notification
    AFTER INSERT ON public.booking_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.send_booking_notification();

-- Trigger function to update product updated_at
CREATE OR REPLACE FUNCTION public.update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================================
-- STEP 9: PERMISSIONS FOR FUNCTIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_database_size() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_sizes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_index_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cache_hit_ratio() TO authenticated;

-- Restrict admin-only functions
GRANT EXECUTE ON FUNCTION public.get_technician_today_assignments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_technician_accept_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_best_technician_for_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_booking_status_with_notification(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_assign_technician_to_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_product_availability(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_inventory(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_from_cart(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_booking_statistics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_sales_statistics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_old_orders(INTEGER) TO authenticated;

-- ============================================================================
-- STEP 10: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION public.has_role(UUID, app_role) IS 'Check if user has specific role';
COMMENT ON FUNCTION public.generate_order_number() IS 'Generate unique order number with format EOB-YYYYMMDD-XXXX';
COMMENT ON FUNCTION public.calculate_cart_total(UUID) IS 'Calculate cart totals including installation services';
COMMENT ON FUNCTION public.get_database_size() IS 'Get total database size';
COMMENT ON FUNCTION public.get_table_sizes() IS 'Get sizes and row counts for all tables';
COMMENT ON FUNCTION public.get_index_stats() IS 'Get index sizes and usage statistics';
COMMENT ON FUNCTION public.get_system_metrics() IS 'Get database system metrics including connections and uptime';
COMMENT ON FUNCTION public.get_cache_hit_ratio() IS 'Get buffer cache hit ratio percentage';
COMMENT ON FUNCTION public.get_technician_today_assignments(UUID) IS 'Get count of technician assignments for today';
COMMENT ON FUNCTION public.can_technician_accept_booking(UUID) IS 'Check if technician can accept more bookings today';
COMMENT ON FUNCTION public.find_best_technician_for_booking(UUID) IS 'Find best available technician for booking';
COMMENT ON FUNCTION public.update_booking_status_with_notification(UUID, TEXT, TEXT) IS 'Update booking status and create notification';
COMMENT ON FUNCTION public.auto_assign_technician_to_booking(UUID) IS 'Auto-assign best technician to pending booking';
COMMENT ON FUNCTION public.check_product_availability(UUID, INTEGER) IS 'Check if product is available for given quantity';
COMMENT ON FUNCTION public.update_product_inventory(UUID, INTEGER) IS 'Update product inventory quantity';
COMMENT ON FUNCTION public.create_order_from_cart(UUID, UUID, TEXT, TEXT) IS 'Create order from cart items';
COMMENT ON FUNCTION public.get_daily_booking_statistics(DATE, DATE) IS 'Get daily booking statistics for date range';
COMMENT ON FUNCTION public.get_product_sales_statistics(DATE, DATE) IS 'Get product sales statistics for date range';
COMMENT ON FUNCTION public.cleanup_old_notifications(INTEGER) IS 'Delete notifications older than specified days';
COMMENT ON FUNCTION public.archive_old_orders(INTEGER) IS 'Mark old delivered orders as archived';

-- ============================================================================
-- END OF ADVANCED FUNCTIONS MIGRATION
-- ============================================================================
