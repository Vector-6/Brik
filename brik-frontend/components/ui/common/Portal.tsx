'use client';

/**
 * Portal Component
 * Renders children into a DOM node that exists outside the parent component's DOM hierarchy
 * This is useful for modals, dropdowns, tooltips, and other overlays that need to escape
 * parent container constraints (overflow, z-index, etc.)
 */

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// Props Interface
// ============================================================================

export interface PortalProps {
  children: ReactNode;
  /**
   * The container element to render into.
   * @default document.body
   */
  container?: HTMLElement | null;
  /**
   * Optional key for the portal
   */
  key?: string | null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Portal component that renders children outside the current DOM hierarchy
 *
 * @example
 * ```tsx
 * <Portal>
 *   <div className="dropdown">Dropdown content</div>
 * </Portal>
 * ```
 *
 * @example With custom container
 * ```tsx
 * <Portal container={customElement}>
 *   <div>Content</div>
 * </Portal>
 * ```
 */
export function Portal({ children, container, key }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mounting to avoid SSR issues
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Don't render during SSR or before mounted
  if (!mounted) {
    return null;
  }

  // Use provided container or default to document.body
  const targetContainer = container || document.body;

  return createPortal(children, targetContainer, key);
}

export default Portal;
