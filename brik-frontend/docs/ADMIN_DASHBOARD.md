# Admin Dashboard

Admin panel for managing tokens on the Brik platform.

## Features

### 1. Authentication
- **Login Page**: `/admin`
- Hardcoded credentials (for now):
  - ID: `admin`
  - Password: `admin123`
- Secure login form with password visibility toggle
- Protected routes with authentication check

### 2. Dashboard
- **Dashboard Page**: `/admin/dashboard`
- Token management interface with glassmorphism design
- Statistics cards showing:
  - Total tokens
  - RWA tokens count
  - Crypto tokens count
  - Active tokens count

### 3. Token Management

#### View Tokens
- Table view with all token information
- Displays:
  - Token image and name
  - Symbol
  - Type (RWA/Crypto)
  - Decimals
  - Status (Active/Inactive)
  - Number of supported chains
  - Action buttons (Edit/Delete)

#### Search & Filter
Search tokens by:
- Symbol
- Name
- CoinGecko ID

Filter tokens by:
- Type: All, RWA only, Crypto only
- Status: All, Active only, Inactive only
- Chain ID: Filter by specific blockchain

#### Add Token
Click "Add Token" button to create a new token with:
- Symbol *
- Name *
- Decimals * (0-18)
- Type * (Crypto/RWA)
- CoinGecko ID *
- Image URL *
- Active status (checkbox)
- Chain addresses (add multiple chain/address pairs)

#### Edit Token
Click the edit icon on any token row to update all fields including:
- Basic information
- Status
- Chain addresses (add/remove)

#### Delete Token
Click the trash icon on any token row to delete a token (with confirmation)

## Data Structure

The admin dashboard uses the `AdminToken` type which matches the backend database structure:

```typescript
interface AdminToken {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
  addresses: Record<string, string>; // chainId -> contract address
  image: string;
  type: "crypto" | "rwa";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Future API Integration

The dashboard is currently using hardcoded mock data. To integrate with the backend:

### Endpoints to implement:

```typescript
// Get all tokens with filters
GET /api/tokens/database/all
GET /api/tokens/database/all?type=rwa
GET /api/tokens/database/all?type=crypto&isActive=true
GET /api/tokens/database/all?search=USDC
GET /api/tokens/database/all?chainId=1

// Create token
POST /api/tokens/database
Body: AdminToken (without _id, createdAt, updatedAt)

// Update token
PUT /api/tokens/database/:id
Body: Partial<AdminToken>

// Delete token
DELETE /api/tokens/database/:id
```

### Integration points in code:

1. **AdminDashboard.tsx** - Line ~100
   - Replace `MOCK_TOKENS` with API fetch in `useEffect`
   
2. **handleDeleteToken** - Line ~160
   - Add API call: `DELETE /api/tokens/database/${tokenId}`
   
3. **TokenModal onSave** - Line ~350
   - Add API call for create: `POST /api/tokens/database`
   - Add API call for update: `PUT /api/tokens/database/${token._id}`

## Styling

The admin dashboard follows the Brik design system:
- **Colors**: Purple gradients (#6107e0 to #8f48ff)
- **Theme**: Dark mode with glassmorphism
- **Typography**: Burbank font for headings
- **Effects**: Glow effects, smooth transitions, hover states

## Security Notes

⚠️ **Important**: 
- Current authentication is client-side only (localStorage)
- Replace with proper JWT-based authentication
- Add server-side session validation
- Implement proper password hashing
- Add rate limiting for login attempts
- Use environment variables for admin credentials

## File Structure

```
app/admin/
  ├── layout.tsx           # Admin layout (no navbar/footer)
  ├── page.tsx             # Login page
  └── dashboard/
      └── page.tsx         # Dashboard page

components/features/admin/
  ├── AdminLogin.tsx       # Login form component
  ├── AdminDashboard.tsx   # Dashboard component
  └── index.ts            # Exports

lib/types/
  └── admin.types.ts      # Admin type definitions
```

## Testing

### Login Flow
1. Navigate to `/admin`
2. Enter credentials (admin / admin123)
3. Click "Sign In"
4. Redirect to `/admin/dashboard`

### Token Management
1. View tokens in table
2. Use search and filters
3. Add new token with "Add Token" button
4. Edit token by clicking edit icon
5. Delete token by clicking trash icon

### Protected Routes
1. Try accessing `/admin/dashboard` without login
2. Should redirect to `/admin`
3. Login and verify access granted
