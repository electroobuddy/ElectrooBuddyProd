-- ============================================================================
-- ELECTROBUDDY - SEED DATA & ADMIN USER SETUP
-- ============================================================================
-- Run this LAST after all other setup files (001, 002, 003)
-- Creates admin user and seeds initial data
-- Safe to run multiple times
-- ============================================================================

-- ============================================================================
-- CREATE ADMIN USER
-- ============================================================================

-- IMPORTANT: You must first create the auth user via Supabase Dashboard:
-- 1. Go to: Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Create user with email: electroobuddy@gmail.com
-- 4. Set a secure password
-- 5. Then run this SQL to grant admin role

-- Use the helper function to assign admin role
-- This will automatically find the user and make them an admin
SELECT assign_admin_role('electroobuddy@gmail.com');

-- ============================================================================
-- VERIFICATION - Check admin was created successfully
-- ============================================================================

DO $$
DECLARE
  user_uuid uuid;
  is_admin boolean;
BEGIN
  -- Get user ID
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'electroobuddy@gmail.com';
  
  IF user_uuid IS NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  WARNING: User electroobuddy@gmail.com does not exist yet!';
    RAISE NOTICE '   Please create the user in Supabase Auth first:';
    RAISE NOTICE '   1. Go to Dashboard > Authentication > Users';
    RAISE NOTICE '   2. Click "Add User"';
    RAISE NOTICE '   3. Create: electroobuddy@gmail.com';
    RAISE NOTICE '   4. Then run this SQL again';
    RAISE NOTICE '';
  ELSE
    -- Check if admin
    SELECT EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = user_uuid AND role = 'admin'
    ) INTO is_admin;
    
    IF is_admin THEN
      RAISE NOTICE '';
      RAISE NOTICE '🎉 SUCCESS! Admin user configured!';
      RAISE NOTICE '   Email: electroobuddy@gmail.com';
      RAISE NOTICE '   Login URL: http://localhost:5173/admin/login';
      RAISE NOTICE '   Status: Admin access granted ✅';
      RAISE NOTICE '';
    ELSE
      RAISE NOTICE '❌ ERROR: Could not assign admin role!';
      RAISE NOTICE '   Contact support for assistance.';
      RAISE NOTICE '';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SEED DEFAULT SERVICES (if they don't exist)
-- ============================================================================

INSERT INTO public.services (title, description, icon_name, sort_order) VALUES
  ('Electrical Installation', 'Professional electrical installation services for homes and offices', 'Zap', 1),
  ('Repairs & Maintenance', 'Quick and reliable electrical repairs and maintenance', 'Tool', 2),
  ('Fan Installation', 'Expert ceiling fan and appliance fan installation', 'Wind', 3),
  ('Wiring Services', 'Complete wiring solutions for new and existing buildings', 'Cable', 4),
  ('Lighting Solutions', 'Modern lighting installation and design services', 'Lightbulb', 5),
  ('Safety Inspections', 'Comprehensive electrical safety checks and certifications', 'Shield', 6)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DEFAULT SITE SETTINGS
-- ============================================================================

INSERT INTO public.site_settings (key, value) VALUES
  ('phone_number', '+918109308287'),
  ('whatsapp_number', '918109308287'),
  ('business_hours', 'Mon-Sat: 9:00 AM - 6:00 PM'),
  ('service_areas', 'Kolkata and surrounding areas'),
  ('emergency_contact', '+918109308287')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================================
-- SEED SAMPLE TEAM MEMBERS (Optional - for demo)
-- ============================================================================

INSERT INTO public.team_members (name, role, bio, sort_order) VALUES
  ('Rajesh Kumar', 'Senior Electrician', '15+ years of experience in electrical installations and repairs', 1),
  ('Priya Sharma', 'Customer Support', 'Dedicated to ensuring excellent customer service', 2),
  ('Amit Ghosh', 'Technical Expert', 'Certified electrical engineer specializing in modern smart home systems', 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED SAMPLE TESTIMONIALS (Optional - for demo)
-- ============================================================================

INSERT INTO public.testimonials (name, rating, text, service) VALUES
  ('Sneha M.', 5, 'Excellent service! Very professional and punctual.', 'Fan Installation'),
  ('Rahul B.', 5, 'Quick response and reasonable pricing. Highly recommended!', 'Electrical Repairs'),
  ('Anita D.', 5, 'Great work quality. The technician was very knowledgeable.', 'Wiring Services')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LIST ALL ADMINS
-- ============================================================================

SELECT 
  u.id,
  u.email,
  r.role,
  u.created_at as user_created,
  'Can access admin panel' as status
FROM auth.users u
JOIN user_roles r ON r.user_id = u.id
WHERE r.role = 'admin'
ORDER BY u.created_at DESC;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '     🎉 ELECTROBUDDY DATABASE SETUP COMPLETE! 🎉';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Core tables created';
  RAISE NOTICE '✅ E-commerce features enabled';
  RAISE NOTICE '✅ Technician management configured';
  RAISE NOTICE '✅ Admin dashboard functions installed';
  RAISE NOTICE '✅ RLS policies applied (secure)';
  RAISE NOTICE '✅ Helper functions deployed';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '   1. Create admin user in Supabase Auth';
  RAISE NOTICE '   2. Login at: http://localhost:5173/admin/login';
  RAISE NOTICE '   3. Configure products and services';
  RAISE NOTICE '   4. Start accepting bookings!';
  RAISE NOTICE '';
  RAISE NOTICE '📁 Files Created:';
  RAISE NOTICE '   - 001-core-setup.sql (run first)';
  RAISE NOTICE '   - 002-ecommerce-setup.sql';
  RAISE NOTICE '   - 003-technicians-setup.sql';
  RAISE NOTICE '   - 004-seed-data-and-admin.sql (run last)';
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  Cleanup: You can now delete these temporary SQL files:';
  RAISE NOTICE '   - All *.sql files in root (except the 4 numbered ones)';
  RAISE NOTICE '   - Keep only migrations/ folder for version control';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
