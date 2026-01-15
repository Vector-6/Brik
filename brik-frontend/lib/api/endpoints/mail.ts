/**
 * Mail API Endpoints
 * Functions for sending newsletter subscriptions, contact forms, and RWA suggestions
 */

import apiClient, { getErrorMessage } from '../client';
import {
  NewsletterDto,
  ContactUsDto,
  RwaListingSuggestionDto,
  MailSuccessResponse,
  MailErrorResponse,
  NewsletterApiResponse,
  ContactUsApiResponse,
  RwaListingSuggestionApiResponse,
  isMailErrorResponse
} from '../types/mail.types';

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * Subscribe to newsletter
 * 
 * @param data - Newsletter subscription data
 * @returns Promise resolving to success/error response
 * 
 * @example
 * try {
 *   const result = await subscribeToNewsletter({ email: 'user@example.com' });
 *   console.log('Subscribed successfully:', result.message);
 * } catch (error) {
 *   console.error('Subscription failed:', getErrorMessage(error));
 * }
 */
export async function subscribeToNewsletter(
  data: NewsletterDto
): Promise<MailSuccessResponse> {
  try {
    const response = await apiClient.post<NewsletterApiResponse>('/mail/newsletter', data);
    
    if (isMailErrorResponse(response.data)) {
      throw response.data;
    }
    
    return response.data as MailSuccessResponse;
  } catch (error: any) {
    // If it's already a mail error response, re-throw it
    if (isMailErrorResponse(error)) {
      throw error;
    }
    
    // For Axios errors, extract the response data if available
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    
    // Fallback error
    throw {
      message: getErrorMessage(error),
      error: 'Network Error',
      statusCode: 500
    } as MailErrorResponse;
  }
}

/**
 * Send contact us message
 * 
 * @param data - Contact form data
 * @returns Promise resolving to success/error response
 * 
 * @example
 * try {
 *   const result = await sendContactMessage({
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     subject: 'Product Question',
 *     message: 'I have a question about your RWA offerings.'
 *   });
 *   console.log('Message sent:', result.message);
 * } catch (error) {
 *   console.error('Failed to send message:', getErrorMessage(error));
 * }
 */
export async function sendContactMessage(
  data: ContactUsDto
): Promise<MailSuccessResponse> {
  try {
    const response = await apiClient.post<ContactUsApiResponse>('/mail/contact-us', data);
    
    if (isMailErrorResponse(response.data)) {
      throw response.data;
    }
    
    return response.data as MailSuccessResponse;
  } catch (error: any) {
    // If it's already a mail error response, re-throw it
    if (isMailErrorResponse(error)) {
      throw error;
    }
    
    // For Axios errors, extract the response data if available
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    
    // Fallback error
    throw {
      message: getErrorMessage(error),
      error: 'Network Error',
      statusCode: 500
    } as MailErrorResponse;
  }
}

/**
 * Submit RWA listing suggestion
 * 
 * @param data - RWA suggestion form data (without email - will be extracted from user session)
 * @returns Promise resolving to success/error response
 * 
 * @example
 * try {
 *   const result = await submitRwaSuggestion({
 *     email: 'user@example.com',
 *     assetName: 'Tokenized Farmland',
 *     category: 'Real Estate',
 *     assetDescription: 'High-quality farmland in Iowa with strong yield history',
 *     marketSize: '$500M annual market',
 *     whyThisAsset: 'Strong demand for agricultural assets as inflation hedge'
 *   });
 *   console.log('Suggestion submitted:', result.message);
 * } catch (error) {
 *   console.error('Failed to submit suggestion:', getErrorMessage(error));
 * }
 */
export async function submitRwaSuggestion(
  data: RwaListingSuggestionDto
): Promise<MailSuccessResponse> {
  try {
    const response = await apiClient.post<RwaListingSuggestionApiResponse>('/mail/rwa-listing-suggestion', data);
    
    if (isMailErrorResponse(response.data)) {
      throw response.data;
    }
    
    return response.data as MailSuccessResponse;
  } catch (error: any) {
    // If it's already a mail error response, re-throw it
    if (isMailErrorResponse(error)) {
      throw error;
    }
    
    // For Axios errors, extract the response data if available
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    
    // Fallback error
    throw {
      message: getErrorMessage(error),
      error: 'Network Error',
      statusCode: 500
    } as MailErrorResponse;
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate newsletter subscription data
 */
export function validateNewsletterData(data: NewsletterDto): string[] {
  const errors: string[] = [];
  
  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  return errors;
}

/**
 * Validate contact us data
 */
export function validateContactData(data: ContactUsDto): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.subject?.trim()) {
    errors.subject = 'Subject is required';
  }
  
  if (!data.message?.trim()) {
    errors.message = 'Message is required';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }
  
  return errors;
}

/**
 * Validate RWA suggestion data
 */
export function validateRwaData(data: RwaListingSuggestionDto): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.assetName?.trim()) {
    errors.assetName = 'Asset name is required';
  }
  
  if (!data.category) {
    errors.category = 'Please select a category';
  }
  
  if (!data.assetDescription?.trim()) {
    errors.assetDescription = 'Asset description is required';
  } else if (data.assetDescription.trim().length < 20) {
    errors.assetDescription = 'Description must be at least 20 characters';
  }
  
  if (!data.whyThisAsset?.trim()) {
    errors.whyThisAsset = 'Rationale is required';
  } else if (data.whyThisAsset.trim().length < 30) {
    errors.whyThisAsset = 'Rationale must be at least 30 characters';
  }
  
  return errors;
}
