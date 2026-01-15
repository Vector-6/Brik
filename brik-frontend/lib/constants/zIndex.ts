/**
 * Z-Index Constants
 * Centralized z-index values to maintain consistent layering across the application
 *
 * Usage:
 * import { Z_INDEX } from '@/lib/constants/zIndex';
 * className={`fixed inset-0 ${Z_INDEX.MODAL_BACKDROP}`}
 */

export const Z_INDEX = {
  // Negative layers - behind content
  BACKGROUND: '-z-10', // Background gradients, particles, decorative elements

  // Base layers - normal document flow (0-30)
  BASE: 'z-0', // Default/base layer (explicitly setting to 0)
  CONTENT: 'z-10', // Elevated content like cards (only when needed)
  STICKY: 'z-20', // Sticky headers, section dividers
  FLOATING: 'z-30', // Floating UI elements like tooltips, badges

  // Interactive layers - user interactions (40-60)
  SWAP_SWITCH_BUTTON: 'z-35', // Swap direction toggle button (between inputs and dropdowns)
  DROPDOWN: 'z-40', // Dropdowns, popovers, select menus
  NAVBAR: 'z-50', // Fixed navigation bar
  SIDE_PANEL: 'z-90', // Side panels, drawers (settings, filters)

  // Overlay layers - blocking UI (70-100)
  TOAST: 'z-70', // Toast notifications
  MODAL_BACKDROP: 'z-80', // Modal backdrop overlays
  MODAL_CONTENT: 'z-90', // Modal content (dialogs, confirmations)
  CRITICAL_ALERT: 'z-100', // Critical alerts that must be seen
  LOADING_OVERLAY: 'z-110', // Full-screen loading overlays (blocks everything)
} as const;

/**
 * Numeric z-index values for programmatic use (e.g., inline styles, libraries)
 */
export const Z_INDEX_VALUES = {
  BACKGROUND: -10,
  BASE: 0,
  CONTENT: 10,
  STICKY: 20,
  FLOATING: 30,
  SWAP_SWITCH_BUTTON: 35,
  DROPDOWN: 40,
  NAVBAR: 50,
  SIDE_PANEL: 60,
  TOAST: 70,
  MODAL_BACKDROP: 80,
  MODAL_CONTENT: 90,
  CRITICAL_ALERT: 100,
  LOADING_OVERLAY: 110,
} as const;

/**
 * Helper function to get numeric value from class string
 */
export function getZIndexValue(zIndexClass: string): number {
  const match = zIndexClass.match(/-?z-(\d+)/);
  return match ? parseInt(match[1], 10) * (zIndexClass.startsWith('-') ? -1 : 1) : 0;
}

/**
 * Z-Index hierarchy documentation
 *
 * -10: Background elements (particles, gradients)
 *   0: Base content layer
 *  10: Elevated content (cards, sections) - use sparingly
 *  20: Sticky elements (section headers)
 *  30: Floating UI (tooltips, badges)
 *  35: Swap switch button (between inputs and dropdowns)
 *  40: Dropdowns and popovers
 *  50: Navbar/header
 *  60: Side panels (settings panel, filters)
 *  70: Toast notifications
 *  80: Modal backdrops
 *  90: Modal content
 * 100: Critical alerts
 * 110: Loading overlays
 */
