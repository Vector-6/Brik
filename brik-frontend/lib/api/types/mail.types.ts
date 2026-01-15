/**
 * Mail API Type Definitions
 * Types for newsletter subscription, contact us, and RWA listing suggestion emails
 */

// ============================================================================
// Request DTOs
// ============================================================================

/**
 * Newsletter subscription request
 */
export interface NewsletterDto {
  email: string;
}

/**
 * Contact us form request
 */
export interface ContactUsDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * RWA listing suggestion request
 */
export interface RwaListingSuggestionDto {
  email: string;
  assetName: string;
  category: RwaCategory;
  assetDescription: string;
  marketSize?: string; // optional
  whyThisAsset: string;
}

/**
 * RWA Category enum values
 */
export type RwaCategory = 
  | "Commodities (Gold, Silver, etc.)"
  | "Real Estate"
  | "Treasury Bonds"
  | "Carbon Credits"
  | "Renewable Energy"
  | "Art & Collectibles"
  | "Other";

// ============================================================================
// Response Types
// ============================================================================

/**
 * Success response for all mail operations
 */
export interface MailSuccessResponse {
  message: string;
}

/**
 * Error response for mail operations
 */
export interface MailErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

// ============================================================================
// Form State Types (for UI components)
// ============================================================================

/**
 * Form submission states
 */
export type FormSubmissionStatus = "idle" | "loading" | "success" | "error";

/**
 * Newsletter form state
 */
export interface NewsletterFormState {
  email: string;
  status: FormSubmissionStatus;
  error?: string;
}

/**
 * Contact form state
 */
export interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: FormSubmissionStatus;
  errors: Record<string, string>;
}

/**
 * RWA suggestion form state
 */
export interface RwaFormState {
  email: string;
  assetName: string;
  category: string;
  assetDescription: string;
  marketSize: string;
  whyThisAsset: string;
  status: FormSubmissionStatus;
  errors: Record<string, string>;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Newsletter subscription API response
 */
export type NewsletterApiResponse = MailSuccessResponse | MailErrorResponse;

/**
 * Contact us API response
 */
export type ContactUsApiResponse = MailSuccessResponse | MailErrorResponse;

/**
 * RWA listing suggestion API response
 */
export type RwaListingSuggestionApiResponse = MailSuccessResponse | MailErrorResponse;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if response is a mail error
 */
export function isMailErrorResponse(response: any): response is MailErrorResponse {
  return (
    response &&
    typeof response === 'object' &&
    'statusCode' in response &&
    'error' in response &&
    'message' in response
  );
}

/**
 * Type guard to check if response is a mail success
 */
export function isMailSuccessResponse(response: any): response is MailSuccessResponse {
  return (
    response &&
    typeof response === 'object' &&
    'message' in response &&
    !('statusCode' in response)
  );
}

/**
 * Type guard for valid RWA category
 */
export function isValidRwaCategory(category: string): category is RwaCategory {
  const validCategories: RwaCategory[] = [
    "Commodities (Gold, Silver, etc.)",
    "Real Estate",
    "Treasury Bonds",
    "Carbon Credits",
    "Renewable Energy",
    "Art & Collectibles",
    "Other"
  ];
  return validCategories.includes(category as RwaCategory);
}
