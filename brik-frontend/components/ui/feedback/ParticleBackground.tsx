'use client';

import { motion } from 'framer-motion';

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-primary to-gold rounded-full opacity-30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
