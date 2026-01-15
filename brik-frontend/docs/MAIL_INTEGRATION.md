# Mail API Integration Documentation

## Overview
This document describes the integration of mail API endpoints for newsletter subscriptions, contact forms, and RWA listing suggestions across the Brik frontend application.

## Features Implemented

### 1. Newsletter Subscription (Footer)
- **Location**: Footer component (`/components/ui/layout/Footer.tsx`)
- **Endpoint**: `POST /mail/newsletter`
- **Functionality**: 
  - Email validation
  - Success/error state handling
  - Automatic form reset after success
  - User-friendly error messages

### 2. Contact Us Form
- **Location**: Contact page (`/components/features/contact/ContactForm.tsx`)
- **Endpoint**: `POST /mail/contact-us`
- **Fields**: Name, Email, Subject, Message
- **Functionality**:
  - Comprehensive form validation
  - Real-time field validation feedback
  - Success confirmation with animation
  - Error handling with retry capability

### 3. RWA Listing Suggestion Form
- **Location**: Contact page (`/components/features/contact/RWASuggestion.tsx`)
- **Endpoint**: `POST /mail/rwa-listing-suggestion`
- **Fields**: Email, Asset Name, Category, Asset Description, Market Size (optional), Why This Asset
- **Functionality**:
  - Category dropdown with predefined options
  - Enhanced validation for description length
  - Visual success feedback
  - Error handling with detailed messages

## API Configuration

### Base URL
The API base URL is configured via environment variables:
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```
If not set, defaults to `http://localhost:3000/api`

### Endpoints Structure
```
POST /mail/newsletter
POST /mail/contact-us
POST /mail/rwa-listing-suggestion
```

## File Structure

### API Layer
```
lib/api/
├── client.ts                 # Axios client with base URL config
├── endpoints/
│   ├── index.ts             # Central export point
│   └── mail.ts              # Mail API functions
└── types/
    ├── api.types.ts         # Main API types (includes mail exports)
    └── mail.types.ts        # Mail-specific types
```

### Components
```
components/
├── ui/layout/
│   └── Footer.tsx           # Newsletter subscription
└── features/contact/
    ├── ContactForm.tsx      # Contact us form
    ├── RWASuggestion.tsx    # RWA suggestion form
    └── ContactForms.tsx     # Container component
```

## Usage Examples

### Newsletter Subscription
```typescript
import { subscribeToNewsletter } from '@/lib/api/endpoints/mail';

try {
  await subscribeToNewsletter({ email: 'user@example.com' });
  // Handle success
} catch (error) {
  // Handle error
}
```

### Contact Form
```typescript
import { sendContactMessage } from '@/lib/api/endpoints/mail';

try {
  await sendContactMessage({
    name: 'John Doe',
    email: 'john@example.com', 
    subject: 'Product Question',
    message: 'I have a question about RWA trading.'
  });
  // Handle success
} catch (error) {
  // Handle error
}
```

### RWA Suggestion
```typescript
import { submitRwaSuggestion } from '@/lib/api/endpoints/mail';

try {
  await submitRwaSuggestion({
    email: 'user@example.com',
    assetName: 'Tokenized Farmland',
    category: 'Real Estate',
    assetDescription: 'High-quality farmland in Iowa with strong yield history.',
    marketSize: '$500M annual market',
    whyThisAsset: 'Strong demand for agricultural assets as inflation hedge.'
  });
  // Handle success  
} catch (error) {
  // Handle error
}
```

## Error Handling

### Client-Side Validation
- Email format validation using regex
- Required field validation
- Minimum length validation for text fields
- Real-time feedback as user types

### Server Error Handling
- Network error detection
- HTTP status code handling
- User-friendly error messages
- Automatic retry for temporary failures
- Form state preservation on errors

### Error Response Types
```typescript
interface MailErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}
```

## Form States

### Submission Status
- `idle`: Form ready for input
- `loading`: Submission in progress
- `success`: Successfully submitted
- `error`: Submission failed

### State Management
Each form maintains its own state with:
- Form data
- Validation errors
- Submission status
- Error messages

## Accessibility Features

- Proper ARIA labels and descriptions
- Form validation with screen reader support
- Keyboard navigation support
- Focus management
- Error announcements

## Styling & UI

- Consistent with existing design system
- Glassmorphism design elements
- Smooth animations using Framer Motion
- Responsive layout for all screen sizes
- Visual feedback for form validation

## Backend API Requirements

The backend should implement these endpoints according to the Mail API Documentation:

1. **Newsletter**: `POST /mail/newsletter`
2. **Contact**: `POST /mail/contact-us`
3. **RWA Suggestion**: `POST /mail/rwa-listing-suggestion`

Each endpoint should:
- Validate input data
- Send emails via Resend service
- Return appropriate success/error responses
- Include CORS headers for frontend requests

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Backend Requirements
```bash
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@your-domain.com
ADMIN_EMAIL=admin@your-domain.com
```

## Testing

### Manual Testing
1. Newsletter subscription in footer
2. Contact form submission
3. RWA suggestion submission
4. Error handling scenarios
5. Form validation

### Error Scenarios to Test
- Invalid email format
- Empty required fields
- Network failures
- Server errors (400, 500)
- Rate limiting (429)

## Future Enhancements

1. **Form Analytics**: Track submission rates and common errors
2. **A/B Testing**: Test different form layouts and copy
3. **Autocompletion**: Save user preferences for faster form filling
4. **File Uploads**: Allow attachment uploads for RWA suggestions
5. **Email Templates**: Rich HTML email templates for better presentation
6. **Captcha Integration**: Add bot protection for public forms
