/**
 * DesktopNav Component
 * Desktop navigation for Navbar
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { CustomConnectButton } from '@/components/features/auth/ConnectButton';
import GlobalSearch from './GlobalSearch';

interface Props {
  pathname: string;
  navLinks: Array<{ name: string; href: string }>;
}

export default function DesktopNav({ pathname, navLinks }: Props) {
  return (
    <div className="hidden lg:flex items-center justify-between h-11 gap-8">
      {/* Left Section: Logo + Navigation Items */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2" aria-label="Brik home">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cursor-pointer relative h-10 w-auto"
          >
            <Image
              src="/images/new/logo12.png"
              alt="Brik Logo"
              width={120}
              height={36}
              className="h-10 w-auto object-contain rounded"
              priority
              quality={100}
            />
          </motion.div>
        </Link>

        {/* Vertical Separator for clear distinction */}
        <div className="h-8 w-px bg-white/10" aria-hidden="true" />

        {/* Navigation Items - No bubble, larger size to match logo prominence */}
        <nav className="flex items-center gap-2">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={`
                    relative text-lg font-burbank transition-all duration-200 whitespace-nowrap
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg px-5 py-2.5
                    ${
                      isActive
                        ? 'text-[rgba(255,213,0,1)] font-bold bg-white/10'
                        : 'text-[rgb(255,214,0)] hover:text-yellow-200 hover:bg-white/5 font-semibold'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.name}
                  {/* Active underline indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-yellow-400 rounded-full"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 flex justify-center max-w-2xl mx-auto">
        <GlobalSearch />
      </div>

      {/* Right: Connect Wallet Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-end flex-shrink-0"
      >
        <CustomConnectButton />
      </motion.div>
    </div>
  );
}
