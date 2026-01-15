/**
 * GradientText Component
 * Applies gradient effects to text content with various preset gradients
 * and customization options
 */

import { type ReactNode, type HTMLAttributes } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Available gradient presets
 */
export type GradientPreset =
  | 'primary' // Primary purple to gold
  | 'purple' // Purple variations
  | 'gold' // Gold variations
  | 'silver' // Silver metallic
  | 'sunset' // Warm sunset colors
  | 'ocean' // Cool ocean colors
  | 'fire' // Warm fire colors
  | 'custom'; // Use custom gradient prop

/**
 * Gradient animation types
 */
export type GradientAnimation = 'none' | 'flow' | 'shimmer' | 'glow';

// ============================================================================
// Props Interface
// ============================================================================

export interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The text content to apply gradient to
   */
  children: ReactNode;

  /**
   * Preset gradient style
   * @default 'primary'
   */
  preset?: GradientPreset;

  /**
   * Custom gradient CSS value (used when preset is 'custom')
   * @example 'linear-gradient(90deg, #ff0000, #00ff00)'
   */
  gradient?: string;

  /**
   * Animation effect for the gradient
   * @default 'none'
   */
  animate?: GradientAnimation;

  /**
   * HTML element to render as
   * @default 'span'
   */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div';

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Gradient Presets
// ============================================================================

const GRADIENT_PRESETS: Record<Exclude<GradientPreset, 'custom'>, string> = {
  primary: 'linear-gradient(135deg, #6107e0 0%, #ffd700 100%)',
  purple: 'linear-gradient(90deg, #e879f9 0%, #22d3ee 60%, #a855f7 100%)',
  gold: 'linear-gradient(135deg, #ffd700 0%, #ffa500 50%, #ff8c00 100%)',
  silver: 'linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 50%, #a8a8a8 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
  ocean: 'linear-gradient(135deg, #667eea 0%, #48bb78 50%, #38b2ac 100%)',
  fire: 'linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #ff6b6b 100%)',
};

// ============================================================================
// Animation Classes
// ============================================================================

const ANIMATION_CLASSES: Record<GradientAnimation, string> = {
  none: '',
  flow: 'animate-gradient',
  shimmer: 'animate-shimmer',
  glow: 'animate-glow',
};

// ============================================================================
// Component
// ============================================================================

/**
 * GradientText component that applies gradient effects to text
 *
 * @example Basic usage with default gradient
 * ```tsx
 * <GradientText>Hello World</GradientText>
 * ```
 *
 * @example With preset gradient
 * ```tsx
 * <GradientText preset="gold">Premium Feature</GradientText>
 * ```
 *
 * @example With animation
 * ```tsx
 * <GradientText preset="primary" animate="flow">
 *   Animated Gradient
 * </GradientText>
 * ```
 *
 * @example With custom gradient
 * ```tsx
 * <GradientText
 *   preset="custom"
 *   gradient="linear-gradient(90deg, #ff0000, #00ff00, #0000ff)"
 * >
 *   Custom Colors
 * </GradientText>
 * ```
 *
 * @example As heading element
 * ```tsx
 * <GradientText as="h1" preset="primary">
 *   Page Title
 * </GradientText>
 * ```
 */
export function GradientText({
  children,
  preset = 'primary',
  gradient,
  animate = 'none',
  as: Component = 'span',
  className = '',
  style,
  ...props
}: GradientTextProps) {
  // Determine the gradient to use
  const gradientValue =
    preset === 'custom' && gradient
      ? gradient
      : GRADIENT_PRESETS[preset as Exclude<GradientPreset, 'custom'>];

  // Build animation class
  const animationClass = ANIMATION_CLASSES[animate];

  // Build complete class string
  const classes = [
    // Base gradient text styles
    'bg-clip-text text-transparent inline-block',
    // Animation
    animationClass,
    // Custom classes
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Combine inline styles
  const combinedStyle = {
    backgroundImage: gradientValue,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    // For animated gradients, we need a larger background size
    ...(animate === 'flow' && { backgroundSize: '250% 250%' }),
    ...style,
  };

  return (
    <Component className={classes} style={combinedStyle} {...props}>
      {children}
    </Component>
  );
}

export default GradientText;
