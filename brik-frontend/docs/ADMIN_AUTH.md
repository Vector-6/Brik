# Admin Authentication Integration

This document describes the admin authentication system integrated with the Brik backend API.

## Overview

The admin authentication system provides secure JWT-based authentication for the admin dashboard. It uses the backend API endpoint for login and maintains the authentication state using localStorage and a custom React hook.

## Components

### 1. API Layer (`lib/api/endpoints/auth.ts`)

Handles all authentication-related API calls:

- **`adminLogin(credentials)`**: Authenticates admin user with email and password
- **`adminLogout()`**: Clears authentication data from localStorage

**Note:** Token validation happens on the server side when making authenticated API calls. No separate verification endpoint is needed.

#### Example Usage:
```typescript
import { adminLogin } from '@/lib/api/endpoints/auth';

const result = await adminLogin({
  email: 'admin@brik.com',
  password: 'brik$1212'
});
```

### 2. Custom Hook (`lib/hooks/useAdminAuth.ts`)

React hook that manages authentication state and operations:

#### Features:
- Auto-initialization from localStorage
- Token restoration on page load
- Login/logout functionality
- Auth header generation for API calls
- Error handling
- Server-side token validation (token verified when making API calls)

#### Usage:
```typescript
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';

function MyComponent() {
  const { 
    isAuthenticated, 
    login, 
    logout, 
    getAuthHeader,
    email,
    error,
    isLoading 
  } = useAdminAuth();

  // Login
  const handleLogin = async () => {
    const result = await login({
      email: 'admin@brik.com',
      password: 'brik$1212'
    });
    
    if (result.success) {
      console.log('Login successful!');
    }
  };

  // Use auth header in API calls
  const headers = getAuthHeader(); // { Authorization: 'Bearer <token>' }
}
```

### 3. AdminLogin Component (`components/features/admin/AdminLogin.tsx`)

Login form with the following features:
- Email and password validation
- Password visibility toggle
- Real-time error display
- Loading states
- Automatic redirect on successful login

#### Default Credentials (from documentation):
```
Email: admin@brik.com
Password: brik$$$$12142342
```

### 4. AdminProtectedRoute Component (`components/features/admin/AdminProtectedRoute.tsx`)

Wrapper component that protects routes from unauthorized access:
- Automatically checks authentication on mount
- Redirects to login page if not authenticated
- Shows loading spinner while verifying

#### Usage:
```tsx
import AdminProtectedRoute from '@/components/features/admin/AdminProtectedRoute';

export default function DashboardPage() {
  return (
    <AdminProtectedRoute>
      <YourProtectedContent />
    </AdminProtectedRoute>
  );
}
```

### 5. AdminDashboard Component (`components/features/admin/AdminDashboard.tsx`)

Updated to use `useAdminAuth` hook:
- Displays logged-in admin email
- Logout functionality integrated
- No more manual localStorage management

## API Integration

### Backend Endpoint
```
POST {NEXT_PUBLIC_API_URL}/auth/login
```

### Request:
```json
{
  "email": "admin@brik.com",
  "password": "brik$1212"
}
```

### Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@brik.com",
  "expiresIn": "24h"
}
```

## Storage

The system stores three items in localStorage:

1. **`adminToken`**: JWT access token
2. **`adminEmail`**: Admin email address
3. **`adminAuth`**: Legacy flag (kept for backward compatibility)

## Security Features

1. **JWT Token Authentication**: Secure token-based auth
2. **Token Storage**: Tokens stored in localStorage for persistence
3. **Protected Routes**: Components check auth before rendering
4. **Automatic Logout**: Clears all auth data on logout
5. **Server-Side Validation**: Token validity checked by backend on each API call
6. **Authorization Headers**: Automatic Bearer token inclusion in requests

## Environment Configuration

Make sure your `.env.local` file has the correct API URL:

```bash
NEXT_PUBLIC_API_URL=https://new-backend-neon.vercel.app/api
# or for local development:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Testing the Integration

1. **Start your backend server** (if running locally)
2. **Navigate to** `/admin`
3. **Enter credentials:**
   - Email: `admin@brik.com`
   - Password: `brik$1212`
4. **Click "Sign In"**
5. **You should be redirected to** `/admin/dashboard`

## Error Handling

The system handles various error scenarios:

- **Invalid credentials**: Shows "Invalid credentials" message
- **Network errors**: Shows appropriate error message
- **Expired token**: Auto-redirects to login
- **Unauthorized access**: Redirects to login page

## Making Authenticated API Calls

When making API calls that require authentication, use the `getAuthHeader()` function:

```typescript
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import apiClient from '@/lib/api/client';

function MyComponent() {
  const { getAuthHeader } = useAdminAuth();

  const fetchProtectedData = async () => {
    const response = await apiClient.get('/admin/tokens', {
      headers: getAuthHeader()
    });
    return response.data;
  };
}
```

## Future Improvements

- [ ] Add refresh token functionality
- [ ] Implement token expiry countdown
- [ ] Add "Remember me" option
- [ ] Implement password reset flow
- [ ] Add multi-factor authentication (MFA)
- [ ] Session timeout warnings

## Troubleshooting

### Login not working?
1. Check if `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is running
3. Check browser console for API errors
4. Ensure credentials match backend

### Redirected to login immediately?
1. Check if token exists in localStorage
2. Ensure browser allows localStorage
3. Check if token was properly stored after login
4. Look for JavaScript errors in console

### Can't access protected routes?
1. Ensure you're logged in
2. Check localStorage for `adminToken`
3. Verify `AdminProtectedRoute` is wrapping the component

## Related Files

- `/lib/api/endpoints/auth.ts` - Auth API functions
- `/lib/hooks/useAdminAuth.ts` - Auth state management hook
- `/lib/types/admin.types.ts` - TypeScript type definitions
- `/components/features/admin/AdminLogin.tsx` - Login form
- `/components/features/admin/AdminProtectedRoute.tsx` - Route protection
- `/components/features/admin/AdminDashboard.tsx` - Dashboard with logout
- `/app/admin/page.tsx` - Admin login page
- `/app/admin/dashboard/page.tsx` - Protected dashboard page
