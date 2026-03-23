# 🚀 Production Deployment Checklist

## Pre-Deployment

### Environment Setup

- [ ] Supabase project created and configured
- [ ] Database credentials secured
- [ ] Environment variables set (.env file)
- [ ] Supabase CLI installed and authenticated
- [ ] Git repository initialized with migrations tracked

### Backup Strategy

- [ ] Existing database backed up (if applicable)
  ```bash
  supabase db dump > backup_pre_migration_$(date +%Y%m%d).sql
  ```
- [ ] Backup verified (test restore on staging)
- [ ] Rollback procedure documented
- [ ] Emergency contacts identified

---

## Migration Execution

### Step 1: Apply Core Schema

```bash
# Command to run
supabase db push --include-all

# OR manually via SQL Editor
# Execute: 20260323000000_complete_database_schema.sql
```

**Verification:**
- [ ] All 28 tables created successfully
- [ ] No errors in migration logs
- [ ] Enums created (app_role with 3 values)
- [ ] All indexes created (check pg_indexes)
- [ ] RLS enabled on all tables

**SQL Verification Queries:**
```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public'; -- Should be 28+

-- Check enums
SELECT unnest(enum_range(NULL::app_role)); -- Should show admin, user, technician

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

---

### Step 2: Apply Advanced Functions

```bash
# Execute: 20260323000001_advanced_functions.sql
```

**Verification:**
- [ ] All functions created successfully
- [ ] No compilation errors
- [ ] Functions execute without errors

**SQL Verification Queries:**
```sql
-- Check function count
SELECT COUNT(*) FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- Test key functions
SELECT public.has_role(auth.uid(), 'admin');
SELECT * FROM public.get_database_size();
SELECT public.generate_order_number();
```

---

### Step 3: Apply Security Hardening

```bash
# Execute: 20260323000002_security_hardening.sql
```

**Verification:**
- [ ] Audit logs table created
- [ ] Rate limit tracker created
- [ ] Validation functions work
- [ ] Triggers created successfully

**SQL Verification Queries:**
```sql
-- Check audit logs
SELECT * FROM audit_logs LIMIT 1;

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## Post-Migration Testing

### User Management Tests

- [ ] New user signup creates profile automatically
- [ ] New user gets 'user' role assigned
- [ ] Admin can be assigned manually
- [ ] Technician can register self

**Test Commands:**
```sql
-- Create test admin
INSERT INTO user_roles (user_id, role)
VALUES ('TEST_USER_ID', 'admin');

-- Verify roles
SELECT u.email, ARRAY_AGG(r.role) as roles
FROM auth.users u
JOIN user_roles r ON u.id = r.user_id
GROUP BY u.id, u.email;
```

### RLS Policy Tests

**Test as Different Users:**

1. **Anonymous User (no login)**
   - [ ] Can view active products
   - [ ] Can view services
   - [ ] Can view testimonials
   - [ ] Cannot view orders
   - [ ] Cannot view cart

2. **Regular User (logged in)**
   - [ ] Can view own profile
   - [ ] Can update own profile
   - [ ] Can create bookings
   - [ ] Can view own bookings
   - [ ] Can manage own cart
   - [ ] Cannot view other users' data
   - [ ] Cannot access admin features

3. **Admin User**
   - [ ] Can view all tables
   - [ ] Can update all tables
   - [ ] Can manage users
   - [ ] Can manage technicians
   - [ ] Can view audit logs
   - [ ] Can access system metrics

**Test Commands:**
```sql
-- Test RLS as specific user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "USER_UUID"}';

-- Run test queries
SELECT * FROM bookings;

-- Reset
RESET ROLE;
RESET "request.jwt.claims";
```

### Business Logic Tests

#### Booking Flow
- [ ] User can create booking
- [ ] Notification created on status change
- [ ] Admin can assign technician
- [ ] Technician can see assigned bookings
- [ ] Auto-assignment function works

**Test Commands:**
```sql
-- Create booking
INSERT INTO bookings (
  user_id, name, email, phone, address,
  service_type, preferred_date, preferred_time
) VALUES (
  'USER_ID',
  'Test User',
  'test@example.com',
  '+919876543210',
  'Test Address',
  'AC Installation',
  CURRENT_DATE + 1,
  '10:00:00'
);

-- Test auto-assign
SELECT public.auto_assign_technician_to_booking('BOOKING_ID');
```

#### Order Flow
- [ ] User can add to cart
- [ ] Cart total calculates correctly
- [ ] Order creation from cart works
- [ ] Inventory updates on order
- [ ] Order items created correctly
- [ ] User can view own orders

**Test Commands:**
```sql
-- Add to cart
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES ('USER_ID', 'PRODUCT_ID', 2);

-- Calculate cart
SELECT * FROM public.calculate_cart_total('USER_ID');

-- Create order
SELECT public.create_order_from_cart(
  'USER_ID',
  'ADDRESS_ID',
  'cod',
  'Test notes'
);
```

### Performance Tests

- [ ] Product search returns results < 100ms
- [ ] Order lookup by ID < 50ms
- [ ] Booking list loads < 200ms
- [ ] Dashboard metrics load < 500ms

**Test Queries:**
```sql
-- Time product search
\timing on
SELECT * FROM products 
WHERE name ILIKE '%fan%' 
AND is_active = true;

-- Check cache hit ratio
SELECT * FROM public.get_cache_hit_ratio();
-- Ratio should be > 90%

-- Check slow queries
SELECT * FROM pg_stat_activity 
WHERE state = 'active' 
AND now() - query_start > interval '5 seconds';
```

### Security Tests

- [ ] SQL injection prevented (test with special chars)
- [ ] Email validation works
- [ ] Phone validation works
- [ ] Input sanitization strips dangerous chars
- [ ] Audit logs record changes
- [ ] Rate limiting activates after threshold

**Test Commands:**
```sql
-- Test email validation
SELECT public.validate_email('invalid-email'); -- false
SELECT public.validate_email('valid@example.com'); -- true

-- Test input sanitization
SELECT public.sanitize_text('Test<script>alert("xss")</script>');

-- Test rate limiting
DO $$
BEGIN
  FOR i IN 1..150 LOOP
    PERFORM public.check_rate_limit('/api/test', 100, 60);
  END LOOP;
END $$;
-- Should return false after 100 requests
```

---

## Data Integrity Checks

### Verify Foreign Keys

```sql
-- Check for orphaned records
SELECT 'orders without user' as issue, COUNT(*)
FROM orders o LEFT JOIN auth.users u ON o.user_id = u.id WHERE u.id IS NULL
UNION ALL
SELECT 'bookings without user', COUNT(*)
FROM bookings b LEFT JOIN auth.users u ON b.user_id = u.id WHERE u.id IS NULL
UNION ALL
SELECT 'cart items without user/session', COUNT(*)
FROM cart_items ci WHERE ci.user_id IS NULL AND ci.session_id IS NULL;
```

### Verify Data Consistency

```sql
-- Orders with correct totals
SELECT o.id, 
  o.total_amount as recorded,
  SUM(oi.total_price) as calculated,
  CASE WHEN o.total_amount = SUM(oi.total_price) THEN 'OK' ELSE 'MISMATCH' END
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
HAVING o.total_amount != SUM(oi.total_price);
-- Should return 0 rows
```

---

## Monitoring Setup

### Enable Query Monitoring

```sql
-- Check pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View top queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### Setup Alerts (Manual Monitoring)

**Daily Checks:**
```sql
-- Database growth
SELECT * FROM public.get_database_size();

-- Active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database();

-- Cache efficiency
SELECT * FROM public.get_cache_hit_ratio();
```

**Weekly Checks:**
```sql
-- Table sizes
SELECT * FROM public.get_table_sizes();

-- Index usage
SELECT * FROM public.get_index_stats();

-- System health
SELECT * FROM public.get_system_metrics();
```

---

## Documentation Updates

- [ ] README_MIGRATIONS.md accessible to team
- [ ] QUICK_REFERENCE.md shared with developers
- [ ] API documentation updated (if needed)
- [ ] Team trained on new functions
- [ ] Support team briefed on changes

---

## Go/No-Go Decision

### Critical Issues (Must Fix Before Go-Live)

- [ ] All migrations apply without errors
- [ ] RLS policies working correctly
- [ ] No data loss or corruption
- [ ] Critical business flows work (booking, orders)
- [ ] Admin dashboard accessible
- [ ] User authentication working

### Non-Critical Issues (Can Fix After Launch)

- [ ] Minor UI issues
- [ ] Additional indexes for edge cases
- [ ] Enhanced monitoring dashboards
- [ ] Additional analytics features

---

## Rollback Plan

If critical issues found:

### Option 1: Restore Backup

```bash
psql -h DB_HOST -U postgres -d postgres < backup_pre_migration.sql
```

### Option 2: Selective Rollback

```sql
-- Drop problematic components
DROP TABLE IF EXISTS problematic_table CASCADE;
DROP FUNCTION IF EXISTS problematic_function();

-- Re-run specific migration
-- Copy/paste relevant section from migration file
```

### Option 3: Feature Flags

Disable problematic features via application settings while keeping core system running.

---

## Post-Launch Monitoring

### First 24 Hours

- [ ] Monitor error logs every hour
- [ ] Check active connections regularly
- [ ] Verify bookings are being created
- [ ] Verify orders are processing
- [ ] Watch for unusual patterns

### First Week

- [ ] Daily performance checks
- [ ] Review audit logs
- [ ] Check database growth rate
- [ ] Monitor cache hit ratio
- [ ] Gather user feedback

### First Month

- [ ] Weekly performance report
- [ ] Analyze slow queries
- [ ] Review index usage
- [ ] Plan optimization improvements
- [ ] Document lessons learned

---

## Success Metrics

### Technical KPIs

- Query response time < 200ms average
- Cache hit ratio > 90%
- Zero critical errors
- 99.9% uptime
- All RLS policies functioning

### Business KPIs

- Booking creation successful
- Order processing smooth
- User complaints = 0
- Admin operations functional
- Technician assignments working

---

## Sign-Off

### Required Approvals

- [ ] Lead Developer approval
- [ ] QA Team approval
- [ ] DevOps approval
- [ ] Product Owner approval

### Deployment Complete When

- [ ] All critical tests pass
- [ ] Performance metrics met
- [ ] No P0/P1 bugs open
- [ ] Stakeholders notified
- [ ] Monitoring active
- [ ] Support team ready

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Lead Developer | [Name] | [Phone/Email] |
| DevOps | [Name] | [Phone/Email] |
| DBA | [Name] | [Phone/Email] |
| Product Owner | [Name] | [Phone/Email] |

---

**Checklist Version**: 1.0  
**Created**: 2026-03-23  
**Status**: Ready for Production Deployment ✅
