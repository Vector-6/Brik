'use client';

import { Wallet, ArrowLeftRight, Zap } from 'lucide-react';
import { GradientText } from '@/components/ui/common';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Wallet,
    title: 'Connect Your Wallet',
    description: 'Securely link your crypto wallet to begin your journey.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Choose Your Asset',
    description: 'Browse and select from premium real-world and crypto assets.',
  },
  {
    icon: Zap,
    title: 'Swap Instantly',
    description: 'Trade seamlessly and transparently, powered by blockchain.',
  },
];

export default function HowItWorks() {
  return (
    <section
      className="min-h-screen w-full relative bg-[#1c1c1c] flex items-center justify-center px-4 py-20 md:py-32 lg:pb-60 overflow-hidden"
      aria-labelledby="how-it-works-heading"
     
    >
      {/* Enhanced background layers inspired by about page */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Top fade gradient */}
   
   
   
      
        {/* Bottom fade gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{
            background:
              'linear-gradient(180deg, rgba(28,28,28,0) 0%, rgba(28,28,28,0.9) 75%, #1c1c1c 100%)'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {/* Section Heading */}
       <h2
            id=""
            className="max-w-3xl font-burbank text-4xl font-extrabold  md:text-5xl"
            style={{
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            How It Works
        </h2>
        <p className="text-lg md:text-xl text-center max-w-2xl mb-16 md:mb-20 text-[rgb(255,214,0)]" >
          Experience seamless asset swaps in three simple steps.
        </p>

        {/* Steps with animated connecting lines - Z-pattern layout */}
        <div className="w-full max-w-5xl mx-auto relative">
          {/* Mobile: Vertical stack */}
          <div className="flex flex-col md:hidden gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="w-full relative"
              >
                <img 
                  src={`/images/card${idx + 1}.png`}
                  alt={step.title}
                  className="w-full h-auto object-contain"
                />
              </motion.div>
            ))}
          </div>

          {/* Desktop: Z-pattern layout with animated lines */}
          <div className="hidden md:block relative" style={{ minHeight: '900px' }}>
            {/* SVG for animated connecting lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 0 }}
              aria-hidden="true"
            >
              {/* Line from Box 1 (top-left) to Box 2 (center-right) */}
              <motion.path
               d="M 150 290 L 150 430 L 1000 430"

                stroke="url(#gradient1)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              />
              
              {/* Line from Box 2 (center-right) to Box 3 (bottom-left) */}
              <motion.path
                        d="M 860 430 L 860 770 L 150 770"


                stroke="url(#gradient2)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
              />
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Box 1: Top Left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="absolute top-0 left-0 w-80"
              style={{ zIndex: 1 }}
            >
              <img 
                src="/images/card1.png"
                alt="Connect Your Wallet"
                className="w-full h-auto"
              />
            </motion.div>

            {/* Box 2: Center Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute top-1/2 -translate-y-1/2 right-0 w-80"
              style={{ zIndex: 1 }}
            >
              <img 
                src="/images/card2.png"
                alt="Choose Your Asset"
                className="w-full h-auto"
              />
            </motion.div>

            {/* Box 3: Bottom Left (aligned with Box 1) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute bottom-0 left-0 w-80"
              style={{ zIndex: 1 }}
            >
              <img 
                src="/images/card3.png"
                alt="Swap Instantly"
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
