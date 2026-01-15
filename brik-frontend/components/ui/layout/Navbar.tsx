"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CustomConnectButton } from "@/components/features/auth/ConnectButton";
import TopRWATicker from "./TopRWATicker";
import MobileMenu from "./MobileMenu";
import DesktopNav from "./DesktopNav";
import GlobalSearch from "./GlobalSearch";

// ============================================================================
// Constants
// ============================================================================

const navLinks = [
  { name: "Swap", href: "/swap" },
  { name: "Explore", href: "/explore" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "News", href: "/news" },
  { name: "Rewards", href: "/rewards" },
];

// Compact spacing tokens for streamlined navbar - Jupiter-style sleek design
const SPACING = {
  containerPadding: "px-4 md:px-6 lg:px-8",
  containerPaddingY: "py-2 md:py-2",
  navGap: "gap-4 md:gap-6",
  mobileGap: "gap-3",
};

// ============================================================================
// Component
// ============================================================================

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Skip to main content - Principle 5: Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute font-burbank focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2    focus:shadow-lg transition-all"
      >
        Skip to main content
      </a>

      <nav
        className="fixed top-0 left-0 w-full right-0 z-50 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500"
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          className={`mx-auto ${SPACING.containerPadding} ${SPACING.containerPaddingY}`}
        >
          {/* Desktop Navigation */}
          <DesktopNav pathname={pathname} navLinks={navLinks} />

          {/* Mobile Layout - Compact */}
          <div className="flex lg:hidden items-center justify-between h-12 gap-3">
            {/* Logo - Slightly larger for branding */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2" aria-label="Brik home">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="cursor-pointer relative h-8 w-auto"
              >
                <Image
                  src="/images/new/logo12.png"
                  alt="Brik Logo"
                  width={110}
                  height={32}
                  className="h-8 w-auto object-contain rounded"
                  priority
                  quality={100}
                />
              </motion.div>
            </Link>

            {/* Search Bar - Mobile (visible when menu closed) */}
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 max-w-md"
              >
                <GlobalSearch isMobile onResultClick={() => setIsOpen(false)} />
              </motion.div>
            )}

            {/* Mobile Menu Button - Principle 5: Accessibility */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-[#e6ee0a] p-2 rounded-lg transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 flex-shrink-0"
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <MobileMenu
                isOpen={isOpen}
                pathname={pathname}
                navLinks={navLinks}
                onClose={() => setIsOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Ticker Bar - Mobile & Desktop */}
        <TopRWATicker onTickerClick={() => setIsOpen(false)} />
      </nav>
    </>
  );
}
