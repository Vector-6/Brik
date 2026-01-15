'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Lock, Puzzle, Ban, Key, Network, Users, ArrowRight } from 'lucide-react';

/**
 * ProblemSolution Component
 *
 * A refined storytelling section with smooth transitions and brand-aligned colors.
 * Brand colors: Purple (#6107E0), Yellow (#FFD600), with yellow accents.
 *
 * Seamlessly transitions from Hero to this section, and from this section to Mission.
 */

// Hook to detect user's motion preference
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Problem Card Component
interface ProblemCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
  prefersReducedMotion: boolean;
}

const ProblemCard = ({ icon: Icon, title, description, delay, prefersReducedMotion }: ProblemCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <motion.div
        className="relative h-full p-8 rounded-3xl backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(25, 25, 35, 0.7) 0%, rgba(20, 20, 30, 0.95) 100%)',
          border: '2px solid rgba(97, 7, 224, 0.25)',
          boxShadow: '0 10px 40px rgba(97, 7, 224, 0.1)',
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
              scale: isHovered ? 1.02 : 1,
              y: isHovered ? -8 : 0,
              borderColor: isHovered ? 'rgba(97, 7, 224, 0.5)' : 'rgba(97, 7, 224, 0.25)',
            }
        }
        transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at center, rgba(97, 7, 224, 0.12) 0%, transparent 70%)',
          }}
        />

        {/* Icon container with celebration animation */}
        <motion.div
          className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, rgba(97, 7, 224, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
            border: '1px solid rgba(97, 7, 224, 0.4)',
          }}
          animate={
            prefersReducedMotion || !isHovered
              ? {}
              : {
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }
          }
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Icon className="w-8 h-8 text-purple-400" />
        </motion.div>

        {/* Content */}
        <h3 className="text-2xl font-bold mb-3 text-white nothingclasstight">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>

        {/* Decorative element - chain link metaphor */}
        <motion.div
          className="absolute bottom-4 right-4 w-8 h-8 opacity-15"
          animate={
            prefersReducedMotion || !isHovered ? {} : { rotate: [0, -10, 0], scale: [1, 1.1, 1] }
          }
          transition={{ duration: 0.6 }}
        >
          <Lock className="w-full h-full text-purple-500" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Solution Card Component
interface SolutionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
  prefersReducedMotion: boolean;
}

const SolutionCard = ({ icon: Icon, title, description, delay, prefersReducedMotion }: SolutionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <motion.div
        className="relative h-full p-8 rounded-3xl backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.10) 0%, rgba(97, 7, 224, 0.10) 100%)',
          border: '2px solid rgba(255, 214, 0, 0.35)',
          boxShadow: '0 10px 40px rgba(255, 214, 0, 0.13)',
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
              scale: isHovered ? 1.02 : 1,
              y: isHovered ? -8 : 0,
              borderColor: isHovered ? 'rgba(255, 214, 0, 0.6)' : 'rgba(255, 214, 0, 0.35)',
            }
        }
        transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 214, 0, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Icon container with celebration animation */}
        <motion.div
          className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.18) 0%, rgba(97, 7, 224, 0.15) 100%)',
            border: '1px solid rgba(255, 214, 0, 0.5)',
          }}
          animate={
            prefersReducedMotion || !isHovered
              ? {}
              : {
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }
          }
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Icon className="w-8 h-8 text-[#FFD600]" />
        </motion.div>

        {/* Content */}
        <h3 className="text-2xl font-bold mb-3 text-white nothingclassnormal">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>

        {/* Decorative element - unlock metaphor */}
        <motion.div
          className="absolute bottom-4 right-4 w-8 h-8 opacity-20"
          animate={
            prefersReducedMotion || !isHovered ? {} : { rotate: [0, -10, 0], scale: [1, 1.1, 1] }
          }
          transition={{ duration: 0.6 }}
        >
          <Key className="w-full h-full text-[#FFD600]" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Main Component
export default function ProblemSolution() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);

  // Scroll tracking for the entire section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform scroll values for smooth animations
  const backgroundOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0, 1, 0.8]);

  const problems = [
    {
      icon: Lock,
      title: 'Illiquidity Trap',
      description: 'The best assets—real estate, private credit—are notoriously illiquid, locking your capital into slow, opaque, 9-to-5 markets with massive transaction costs.',
    },
    {
      icon: Puzzle,
      title: 'Unbearable Complexity',
      description: 'Tokenized assets are scattered across competing chains, forcing users to navigate a confusing maze of protocols, opaque fees, and unnecessary technical risk.',
    },
    {
      icon: Ban,
      title: 'Excluded from Real Value',
      description: 'Legacy systems keep institutional-grade assets behind high minimums, complex verification, and legal hurdles that exclude 99% of investors from meaningful diversification.',
    },
  ];

  const solutions = [
    {
      icon: Key,
      title: '24/7 Global Liquidity',
      description: 'Swap or sell your tokenized assets instantly, worldwide. Break free from traditional banking hours and opaque intermediary fees.',
    },
    {
      icon: Network,
      title: 'Real Yield, Zero Complexity',
      description: 'Stop swapping protocols. Brik aggregates all top RWAs (Treasuries, Gold, Real Estate) into one secure, seamless marketplace for stable, uncorrelated returns.',
    },
    {
      icon: Users,
      title: 'Institutional-Grade, Fractionally Owned',
      description: 'Access high-quality assets (like tokenized U.S. Treasuries) with low minimums. You gain the grade of asset without the barrier to entry.',
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 px-4 md:px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #1A1A24 0%, #1C1C1C 50%, #1A1A24 100%)',
      }}
      aria-labelledby="problem-solution-heading"
    >
      {/* Ambient glow effects matching brand colors */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.06]"
        style={{ background: '#6107E0' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.08]"
        style={{ background: '#FFD600' }}
        aria-hidden="true"
      />

      {/* Additional ambient effect for depth */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 214, 0, 0.07) 0%, transparent 70%)',
          opacity: backgroundOpacity,
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Problems Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-32"
        >
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'rgba(97, 7, 224, 0.08)',
                border: '1px solid rgba(97, 7, 224, 0.25)',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6107E0' }} />
              <span className="text-sm font-medium text-purple-400">The Problem We&apos;re Fighting</span>
            </motion.div>
            <h2 id="problem-solution-heading" className="text-4xl md:text-5xl font-bold text-white mb-4 nothingclasstight">
              Why the Global RWA Market Is Failing Investors
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Global finance traps your most valuable assets, subjecting them to complex legal mazes, slow 9-to-5 markets, and unnecessary volatility.
            </p>
          </motion.div>

          {/* Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {problems.map((problem, index) => (
              <ProblemCard
                key={problem.title}
                {...problem}
                delay={index * 0.15}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </motion.div>

        {/* 74% Statistic - Clean and Focused */}
        <motion.div
          ref={transitionRef}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-32 relative z-10"
        >
          <motion.div
            className="text-8xl md:text-9xl font-black mb-6 text-[#6107E0]"
          >
            74%
          </motion.div>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            of investors report feeling overwhelmed or excluded when trying to access tokenized real-world assets.
          </motion.p>
        </motion.div>

        {/* Solutions Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'rgba(255, 214, 0, 0.10)',
                border: '1px solid rgba(255, 214, 0, 0.3)',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FFD600' }} />
              <span className="text-sm font-medium" style={{ color: '#FFD600' }}>The Liquid Marketplace</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 nothingclassnormal">
              Brik: The Bridge to Instantly Liquid Assets
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              One seamless market. All compliant RWAs. Your control.
            </p>
          </motion.div>

          {/* Solution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {solutions.map((solution, index) => (
              <SolutionCard
                key={solution.title}
                {...solution}
                delay={index * 0.15}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>

          {/* Bottom description */}
          <motion.p
            className="text-center text-gray-400 mt-16 text-lg max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Our platform is the crucial bridge that connects verified, asset-backed tokens from across the industry—including top issuers like Ondo and Centrifuge—into one secure, high-liquidity marketplace.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.a
              href="/swap"
              className="group relative px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden font-burbank"
              style={{
                background: '#FFD600',
                boxShadow: '0 10px 40px rgba(255, 214, 0, 0.18)',
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <span className="relative z-10 text-black flex items-center gap-2">
                Start Trading Real Yield
                <motion.span
                  animate={prefersReducedMotion ? {} : { x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
