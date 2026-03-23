# 🔍 User Role Debugging Guide

## What's Been Added

### 1. **Enhanced Login/Signup Logging** (`UserAuth.tsx`)

When users log in or sign up, the console will now show:

#### On Login:
```javascript
✅ Login successful!
User data: { ... }
🎭 User Roles: [{ role: 'user' }, { role: 'admin' }]
Roles array: ['user', 'admin']
📋 Role Check:
  - Is Admin? true
  - Is Technician? false
  - Is User? true
```

#### On Signup:
```javascript
✅ Signup successful!
User data: { ... }
🆕 New user created with ID: uuid-here
📧 Email: user@example.com
🎭 Default Role Assigned: [{ role: 'user' }]
```

### 2. **Debug Roles Page** (`DebugRoles.tsx`)

A visual page to see all user roles at a glance.

**Access it at:** `http://localhost:8080/debug-roles` (after adding route)

---

## How to Use

### Method 1: Browser Console (Easiest)

1. Open your app in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Log in or sign up
5. Watch the console output showing roles

### Method 2: Debug Page (Visual)

1. Add this route to your `App.tsx`:
```tsx
import DebugRoles from "@/pages/DebugRoles";

// In your routes:
<Route path="/debug-roles" element={<DebugRoles />} />
```

2. Navigate to `/debug-roles` after logging in
3. See a visual display of your roles

---

## Expected Output

### New User Signup Flow:

When a new user signs up, they should automatically get the **'user'** role:

```sql
-- This happens automatically via trigger
INSERT INTO user_roles (user_id, role) 
VALUES ('new-user-id', 'user');
```

**Console will show:**
```
✅ Signup successful!
🆕 New user created with ID: xxx-xxx-xxx
🎭 Default Role Assigned: [{ role: 'user' }]
```

### Existing User Login:

```
✅ Login successful!
🎭 User Roles: [{ role: 'user' }]
📋 Role Check:
  - Is Admin? false
  - Is Technician? false
  - Is User? true
```

### Admin User Login:

```
✅ Login successful!
🎭 User Roles: [{ role: 'user' }, { role: 'admin' }]
📋 Role Check:
  - Is Admin? true ✅
  - Is Technician? false
  - Is User? true
```

---

## Common Issues & Solutions

### Issue 1: No Roles Showing

**Problem:** Console shows empty roles array

**Solution:**
```sql
-- Manually add 'user' role
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'user');
```

### Issue 2: "Error fetching roles"

**Possible causes:**
- RLS policies blocking access
- Trigger didn't fire on user creation

**Check RLS policies:**
```sql
-- Should allow users to view their own roles
CREATE POLICY "Users can view own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);
```

### Issue 3: Multiple Roles

Some users might have multiple roles (e.g., both 'user' and 'admin'). The logs will show:

```javascript
🎭 User Roles: [
  { role: 'user' },
  { role: 'admin' }
]
```

This is normal and expected for admin users.

---

## Testing Different Roles

### Create Test Users

1. **Regular User:**
   - Sign up normally at `/auth`
   - Should get 'user' role automatically

2. **Admin User:**
   ```sql
   -- After signing up, run:
   INSERT INTO user_roles (user_id, role)
   VALUES ('USER_ID', 'admin');
   ```

3. **Technician User:**
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('USER_ID', 'technician');
   
   -- Also create technician profile:
   INSERT INTO technicians (user_id, name, email, phone, status)
   VALUES ('USER_ID', 'Test Tech', 'tech@example.com', '+91-1234567890', 'active');
   ```

---

## Database Queries to Verify

### Check All Users and Their Roles

```sql
SELECT 
  au.email,
  au.created_at,
  ur.role
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
ORDER BY au.created_at DESC;
```

### Check Specific User's Roles

```sql
SELECT ur.*
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'test@example.com';
```

### Find Users Without Roles

```sql
SELECT au.*
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.id IS NULL;
```

---

## Quick Reference

### Role Types:
- `'user'` - Regular customer (default for all new signups)
- `'admin'` - Full system access
- `'technician'` - Service provider access

### Console Emojis:
- ✅ Success
- ❌ Error
- 🎭 Roles
- 📋 Summary
- 🆕 New user
- 📧 Email
- 🔍 Fetching data

---

## Next Steps After Debugging

Once you've verified roles are working:

1. **Remove debug code** (optional):
   - Comment out console.log statements
   - Remove DebugRoles page if added

2. **Set up proper role-based routing**:
   ```tsx
   // Example: Redirect based on role
   if (hasAdminRole) {
     navigate('/admin/dashboard');
   } else if (hasTechnicianRole) {
     navigate('/technician/dashboard');
   } else {
     navigate('/user/dashboard');
   }
   ```

3. **Implement role checks in components**:
   ```tsx
   const { hasRole } = useAuth();
   
   if (!hasRole('admin')) {
     return <Navigate to="/unauthorized" />;
   }
   ```

---

**Happy Debugging! 🐛🔍**
