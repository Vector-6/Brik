# Toast Notification Examples

## Visual Guide for Token Management Notifications

### 🔄 Loading State
When an operation is in progress:
```
┌─────────────────────────────────────┐
│  ⌛  Creating token...               │
│                                     │
│  Background: Purple gradient        │
│  Border: Purple glow                │
└─────────────────────────────────────┘
```

### ✅ Success - Create Token
After successfully creating a token:
```
┌─────────────────────────────────────┐
│  ✅  USDC created successfully! 🎉  │
│                                     │
│  Background: Green gradient         │
│  Border: Green glow                 │
│  Duration: 5 seconds                │
└─────────────────────────────────────┘
```

### ✅ Success - Update Token
After successfully updating a token:
```
┌─────────────────────────────────────┐
│  ✅  USDC updated successfully! ✅  │
│                                     │
│  Background: Green gradient         │
│  Border: Green glow                 │
│  Duration: 5 seconds                │
└─────────────────────────────────────┘
```

### 🗑️ Success - Delete Token
After successfully deleting a token:
```
┌─────────────────────────────────────┐
│  ✅  Token deleted successfully! 🗑️ │
│                                     │
│  Background: Green gradient         │
│  Border: Green glow                 │
│  Duration: 5 seconds                │
└─────────────────────────────────────┘
```

### ❌ Error State
When an operation fails:
```
┌─────────────────────────────────────┐
│  ❌  Failed to create: Token with   │
│      symbol USDC already exists     │
│                                     │
│  Background: Red gradient           │
│  Border: Red glow                   │
│  Duration: 6 seconds                │
└─────────────────────────────────────┘
```

## Toast Styling Details

### Color Palette
- **Success**: Green (#10B981) with glassmorphism
- **Error**: Red (#EF4444) with glassmorphism
- **Loading**: Purple (#6107e0) with glassmorphism
- **Background**: Dark with backdrop blur

### Design Features
1. **Glassmorphism Effect**
   - Backdrop blur: 12px
   - Semi-transparent background
   - Subtle border glow

2. **Animations**
   - Smooth slide-in from top-right
   - Fade out when dismissed
   - Scale effect on hover

3. **Accessibility**
   - High contrast colors
   - Clear icons
   - Readable text
   - Appropriate durations

4. **Positioning**
   - Top-right corner
   - Stacks vertically
   - Auto-dismisses
   - Manually dismissible

## Usage in Code

### Basic Toast
```typescript
toast.success('Operation completed!');
toast.error('Something went wrong!');
toast.loading('Processing...');
```

### Promise-based Toast (Recommended)
```typescript
const promise = someAsyncOperation();

toast.promise(promise, {
  loading: 'Creating token...',
  success: (result) => `${result.data?.symbol} created successfully! 🎉`,
  error: (err) => `Failed to create: ${err?.error || 'Unknown error'}`,
});
```

### Custom Toast
```typescript
toast.custom((t) => (
  <div className={`${t.visible ? 'animate-fadeIn' : 'animate-fadeOut'}`}>
    Custom content here
  </div>
));
```

## Expected Behavior

### Success Flow
1. User initiates action (create/update/delete)
2. Loading toast appears immediately
3. API request is made
4. On success:
   - Loading toast transforms to success toast
   - Success message includes token symbol (if applicable)
   - Auto-dismisses after 5 seconds
   - Modal closes (for create/update)
   - Table updates automatically

### Error Flow
1. User initiates action
2. Loading toast appears
3. API request fails
4. On error:
   - Loading toast transforms to error toast
   - Error message explains what went wrong
   - Auto-dismisses after 6 seconds (longer to read)
   - Modal stays open (for create/update)
   - User can correct and retry

## Testing the Notifications

### Test Create Token
1. Go to Admin Dashboard
2. Click "Add Token"
3. Fill in all required fields
4. Upload an image
5. Click "Save"
6. **Expected**: "Creating token..." → "TOKEN created successfully! 🎉"

### Test Update Token
1. Click "Edit" on any token
2. Change some fields
3. Click "Save"
4. **Expected**: "Updating token..." → "TOKEN updated successfully! ✅"

### Test Delete Token
1. Click "Delete" on any token
2. Confirm deletion
3. **Expected**: "Deleting token..." → "Token deleted successfully! 🗑️"

### Test Error Handling
1. Try to create a token with duplicate symbol
2. **Expected**: Error toast with specific message
3. Try to update with invalid data
4. **Expected**: Error toast explaining validation failure

## Browser Compatibility

✅ Chrome/Edge (Chromium)
✅ Firefox
✅ Safari
✅ Mobile browsers

All animations and effects are CSS-based and widely supported.
