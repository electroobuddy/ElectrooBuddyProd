# ⚡ Quick Reference Guide - ElectrooBuddy Database

## 🎯 Common Operations

### User Management

```sql
-- Create admin user manually
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_UUID_HERE', 'admin');

-- Check user's roles
SELECT * FROM user_roles WHERE user_id = 'USER_UUID';

-- Get all users with roles
SELECT 
  u.email,
  u.created_at,
  ARRAY_AGG(r.role) as roles
FROM auth.users u
LEFT JOIN user_roles r ON u.id = r.user_id
GROUP BY u.id, u.email, u.created_at;

-- Find users without roles
SELECT u.* 
FROM auth.users u
LEFT JOIN user_roles r ON u.id = r.user_id
WHERE r.user_id IS NULL;
```

### Technician Management

```sql
-- Register new technician
INSERT INTO technicians (user_id, name, email, phone, skills, experience, priority)
VALUES (
  'USER_UUID',
  'John Doe',
  'john@example.com',
  '+919876543210',
  '{"AC Repair", "Installation"}',
  5,
  10
);

-- Get technician availability
SELECT 
  t.*,
  public.get_technician_today_assignments(t.id) as today_assignments,
  public.can_technician_accept_booking(t.id) as can_accept
FROM technicians t
WHERE t.status = 'active';

-- Auto-assign technician to booking
SELECT public.auto_assign_technician_to_booking('BOOKING_UUID');
```

### Booking Management

```sql
-- Create new booking
INSERT INTO bookings (
  user_id, name, phone, email, address,
  service_type, preferred_date, preferred_time,
  description
) VALUES (
  'USER_UUID',
  'John Doe',
  '+919876543210',
  'john@example.com',
  '123 Main St, City',
  'AC Installation',
  '2026-03-25',
  '10:00:00',
  'Need AC installation in 3 rooms'
);

-- Update booking status
SELECT public.update_booking_status_with_notification(
  'BOOKING_UUID',
  'confirmed',
  'Technician assigned and confirmed'
);

-- Get pending bookings
SELECT * FROM bookings 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Get bookings by technician
SELECT b.*, t.name as technician_name
FROM bookings b
JOIN technicians t ON b.assigned_technician_id = t.id
WHERE t.id = 'TECHNICIAN_UUID';
```

### Product & Order Management

```sql
-- Add new product
INSERT INTO products (
  name, slug, description, price,
  category, brand, inventory_quantity,
  track_inventory, is_active
) VALUES (
  'Premium Ceiling Fan',
  'premium-ceiling-fan-black',
  'High-quality ceiling fan with remote',
  4999.00,
  'Fans',
  'ElectrooBrand',
  50,
  true,
  true
);

-- Check product availability
SELECT public.check_product_availability('PRODUCT_UUID', 5);

-- Update inventory
SELECT public.update_product_inventory('PRODUCT_UUID', -2); -- Deduct 2

-- Create order from cart
SELECT public.create_order_from_cart(
  'USER_UUID',
  'ADDRESS_UUID',
  'razorpay',
  'Please deliver before 6 PM'
);

-- Get order details
SELECT 
  o.*,
  JSON_AGG(oi) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'ORDER_UUID'
GROUP BY o.id;
```

### Analytics Queries

```sql
-- Today's bookings
SELECT COUNT(*) as total_bookings
FROM bookings
WHERE DATE(created_at) = CURRENT_DATE;

-- This month's revenue (orders)
SELECT 
  SUM(total_amount) as revenue,
  COUNT(*) as total_orders
FROM orders
WHERE DATE(ordered_at) >= DATE_TRUNC('month', NOW())
AND status != 'cancelled';

-- Top selling products
SELECT 
  p.name,
  SUM(oi.quantity) as total_sold,
  SUM(oi.total_price) as revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;

-- Booking conversion rate
WITH bookings_stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) as total
  FROM bookings
)
SELECT 
  completed,
  total,
  ROUND(100.0 * completed / total, 2) as conversion_rate
FROM bookings_stats;

-- Customer lifetime value
SELECT 
  u.email,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as lifetime_value
FROM auth.users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.email
ORDER BY lifetime_value DESC;
```

### RLS Policy Testing

```sql
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "USER_UUID"}';

-- Now run your query
SELECT * FROM bookings;

-- Reset
RESET ROLE;
RESET "request.jwt.claims";
```

### Performance Monitoring

```sql
-- Slow queries (> 5 seconds)
SELECT 
  pid,
  now() - query_start as duration,
  query
FROM pg_stat_activity
WHERE state = 'active'
AND now() - query_start > interval '5 seconds';

-- Table sizes
SELECT * FROM public.get_table_sizes();

-- Index usage
SELECT * FROM public.get_index_stats();

-- Cache efficiency
SELECT * FROM public.get_cache_hit_ratio();

-- Active connections
SELECT * FROM public.get_system_metrics();
```

### Maintenance Tasks

```sql
-- Cleanup old notifications (keep last 90 days)
SELECT public.cleanup_old_notifications(90);

-- Archive old orders (older than 1 year)
SELECT public.archive_old_orders(365);

-- Vacuum analyze (update statistics)
VACUUM ANALYZE bookings;
VACUUM ANALYZE orders;
VACUUM ANALYZE products;

-- Reindex if needed
REINDEX TABLE products;
REINDEX TABLE orders;
```

---

## 🔍 Debugging Queries

### Find Orphaned Records

```sql
-- Orders without user
SELECT * FROM orders o
LEFT JOIN auth.users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- Bookings without user
SELECT * FROM bookings b
LEFT JOIN auth.users u ON b.user_id = u.id
WHERE u.id IS NULL;

-- Cart items without user/session
SELECT * FROM cart_items ci
WHERE ci.user_id IS NULL AND ci.session_id IS NULL;
```

### Data Integrity Checks

```sql
-- Orders with mismatched totals
SELECT 
  o.id,
  o.total_amount as order_total,
  SUM(oi.total_price) as calculated_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
HAVING o.total_amount != SUM(oi.total_price);

-- Products with negative inventory
SELECT * FROM products
WHERE inventory_quantity < 0 AND track_inventory = true;

-- Duplicate user roles
SELECT user_id, role, COUNT(*)
FROM user_roles
GROUP BY user_id, role
HAVING COUNT(*) > 1;
```

---

## 🛠️ Development Tips

### Seed Data for Testing

```sql
-- Create test admin
-- 1. Sign up as regular user first
-- 2. Then run:
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');

-- Create sample services
INSERT INTO services (title, description, icon_name) VALUES
  ('AC Installation', 'Professional AC installation service', 'Snowflake'),
  ('AC Repair', 'Expert AC repair and maintenance', 'Wrench'),
  ('Fan Installation', 'Ceiling fan installation service', 'Zap');

-- Create sample products
INSERT INTO products (name, slug, description, price, inventory_quantity) VALUES
  ('Test Fan', 'test-fan', 'Test product', 999, 10);
```

### Test Different Scenarios

```sql
-- Simulate high traffic (rate limit testing)
DO $$
BEGIN
  FOR i IN 1..150 LOOP
    PERFORM public.check_rate_limit('/api/test', 100, 60);
  END LOOP;
END $$;

-- Test booking notification flow
SELECT public.update_booking_status_with_notification(
  'BOOKING_ID',
  'in_progress',
  'Testing notification system'
);
```

---

## 📊 Key Metrics Dashboard

```sql
-- Daily stats summary
SELECT 
  'Bookings' as metric,
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today,
  COUNT(*) FILTER (WHERE DATE(created_at) >= CURRENT_DATE - 7) as this_week,
  COUNT(*) FILTER (WHERE DATE(created_at) >= CURRENT_DATE - 30) as this_month
FROM bookings
UNION ALL
SELECT 
  'Orders',
  COUNT(*) FILTER (WHERE DATE(ordered_at) = CURRENT_DATE),
  COUNT(*) FILTER (WHERE DATE(ordered_at) >= CURRENT_DATE - 7),
  COUNT(*) FILTER (WHERE DATE(ordered_at) >= CURRENT_DATE - 30)
FROM orders
UNION ALL
SELECT 
  'Revenue (₹)',
  COALESCE(SUM(total_amount) FILTER (WHERE DATE(ordered_at) = CURRENT_DATE), 0),
  COALESCE(SUM(total_amount) FILTER (WHERE DATE(ordered_at) >= CURRENT_DATE - 7), 0),
  COALESCE(SUM(total_amount) FILTER (WHERE DATE(ordered_at) >= CURRENT_DATE - 30), 0)
FROM orders
WHERE status != 'cancelled';
```

---

## 🔐 Security Commands

```sql
-- View all active sessions
SELECT * FROM pg_stat_activity 
WHERE datname = current_database();

-- Force logout specific user (requires admin)
SELECT public.force_logout_user('USER_UUID');

-- View audit logs for sensitive operations
SELECT * FROM audit_logs
WHERE table_name IN ('orders', 'bookings', 'products')
ORDER BY changed_at DESC
LIMIT 100;

-- Check RLS policies on table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'your_table';
```

---

**Quick Reference Version**: 1.0  
**Last Updated**: 2026-03-23
