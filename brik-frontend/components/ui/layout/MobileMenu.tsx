/**
 * MobileMenu Component
 * Mobile navigation menu for Navbar
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CustomConnectButton } from '@/components/features/auth/ConnectButton';

interface Props {
  isOpen: boolean;
  pathname: string;
  navLinks: Array<{ name: string; href: string }>;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, pathname, navLinks, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <motion.div
      id="mobile-navigation"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="lg:hidden overflow-hidden"
    >
      <div className="pt-4 pb-4 space-y-3">
        {navLinks.map((link, index) => {
          const isActive = pathname === link.href;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={link.href}
                className={`
                  block py-2.5 px-3 rounded-lg text-base font-burbank transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
                  ${
                    isActive
                      ? 'text-[#e6ee0a] font-semibold'
                      : 'text-[rgba(255, 214, 0, 1)]'
                  }
                `}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.name}
              </Link>
            </motion.div>
          );
        })}

        {/* Mobile Wallet Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: navLinks.length * 0.05 }}
          className="pt-3 border-t border-white/10"
        >
          <CustomConnectButton />
        </motion.div>
      </div>
    </motion.div>
  );
}
