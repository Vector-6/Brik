"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Twitter,
  MessageCircle,
  Send,
  Shield,
  Lock,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { usePathname } from "next/navigation";
import { subscribeToNewsletter, validateNewsletterData } from "@/lib/api/endpoints/mail";
import { getErrorMessage } from "@/lib/api/client";
import type { FormSubmissionStatus } from "@/lib/api/types/mail.types";

// ============================================================================
// Constants & Types
// ============================================================================

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
  importance: "high" | "medium" | "low";
}

// Route mapping - Principle 3: Consistency
const ROUTE_MAP: Record<string, string> = {
  Swap: "/swap",
  Portfolio: "/portfolio",
  Explore: "/explore",
  News: "/news",
  Rewards: "/rewards",
  About: "/about",
  Careers: "/careers",
  Contact: "/contact",
  Docs: "/docs",
  FAQs: "/faqs",
  Security: "/security",
  API: "/api",
  "Privacy Policy": "/privacy",
  "Terms of Service": "/terms",
  "Cookie Policy": "/cookies",
};

const footerSections: FooterSection[] = [
  {
    title: "Product",
    importance: "high", // Primary navigation
    links: [
      { label: "Swap", href: ROUTE_MAP["Swap"] },
      { label: "Portfolio", href: ROUTE_MAP["Portfolio"] },
      { label: "Explore", href: ROUTE_MAP["Explore"] },
      { label: "News", href: ROUTE_MAP["News"] },
      { label: "Rewards", href: ROUTE_MAP["Rewards"] },
    ],
  },
  {
    title: "Company",
    importance: "medium",
    links: [
      { label: "About", href: ROUTE_MAP["About"] },
      { label: "Contact", href: ROUTE_MAP["Contact"] },
      { label: "FAQs", href: ROUTE_MAP["FAQs"] },
    ],
  },
];

const socials = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/brik" },
  { name: "Discord", icon: MessageCircle, href: "https://discord.gg/brik" },
  { name: "Telegram", icon: Send, href: "https://t.me/brik" },
];

// Trust indicators - builds credibility
const trustIndicators = [
  { icon: Shield, label: "Audited Contracts" },
  { icon: Lock, label: "Bank-Grade Security" },
];

// ============================================================================
// Sub-Components
// ============================================================================

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormSubmissionStatus>("idle");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Client-side validation
    const validationErrors = validateNewsletterData({ email });
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setStatus("loading");
    setError("");
    setSuccessMessage("");

    try {
      const response = await subscribeToNewsletter({ email: email.trim() });
      setStatus("success");
      setEmail("");
      
      // Extract message from backend response
      if (response?.message) {
        setSuccessMessage(response.message);
      } else {
        setSuccessMessage("Successfully subscribed to our newsletter");
      }
      
      // Reset to idle state after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setError(getErrorMessage(err));
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setError("");
      }, 5000);
    }
  };

  const isDisabled = status === "loading" || status === "success";

  return (
    <div className="mt-10">
      <p className="text-sm font-medium text-gray-400 mb-3">Stay Updated</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(""); // Clear error when user types
          }}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg
            focus:border-[#6A0DAD]/50 focus:outline-none focus:ring-1 focus:ring-[#6A0DAD]/30
            text-white placeholder:text-gray-500 text-sm transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Email address for newsletter"
          required
          disabled={isDisabled}
        />
        <motion.button
          type="submit"
          disabled={isDisabled}
          whileHover={!isDisabled ? { scale: 1.02 } : {}}
          whileTap={!isDisabled ? { scale: 0.98 } : {}}
          className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20
            rounded-lg font-medium text-sm text-gray-300 hover:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#6A0DAD]/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
          aria-label="Subscribe to newsletter"
        >
          {status === "loading"
            ? "Sending..."
            : status === "success"
            ? "Subscribed!"
            : "Subscribe"}
        </motion.button>
      </form>
      
      {/* Success Message */}
      {status === "success" && successMessage && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-green-400 mt-2"
        >
          ✓ {successMessage}
        </motion.p>
      )}
      
      {/* Error Message */}
      {status === "error" && error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function MobileAccordionSection({
  section,
  index,
}: {
  section: FooterSection;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left
          focus:outline-none focus:ring-2 focus:ring-[#6A0DAD] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] rounded"
        aria-expanded={isOpen}
        aria-controls={`mobile-footer-section-${index}`}
      >
        <h4
          className={`font-semibold ${
            section.importance === "high"
              ? "text-white text-base"
              : "text-gray-300 text-sm"
          }`}
        >
          {section.title}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            id={`mobile-footer-section-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-3 pb-4"
          >
            {section.links.map((link, linkIndex) => (
              <motion.li
                key={linkIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: linkIndex * 0.05 }}
              >
                <Link
                  href={link.href}
                  className="text-gray-400  hover:text-[#6A0DAD] transition-colors text-sm block py-1
                    focus:outline-none focus:text-[#6A0DAD]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function Footer() {
  const pathname = usePathname();

  // Contextual CTA based on current page - Principle 1: Hierarchy
  const getContextualCTA = () => {
    if (pathname === "/explore")
      return { text: "Start Trading RWAs", href: "/swap" };
    if (pathname === "/swap")
      return { text: "View Your Portfolio", href: "/portfolio" };
    if (pathname === "/") return { text: "Explore Assets", href: "/explore" };
    return { text: "Get Started", href: "/swap" };
  };

  const cta = getContextualCTA();

  return (
    <footer
      className="relative bg-charcoal border-t border-color-border"
      role="contentinfo"
      aria-label="Footer"
    >
      {/* Decorative gradient lines - Principle 7: Alignment */}
      <div
        className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-[#6A0DAD]/30 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-1/3 w-px h-24 bg-gradient-to-b from-[#7B61FF]/20 to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16">
        {/* Main Content Grid - Changed from 5 to 4 columns for better spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">
          {/* Brand Section - Principle 1: Hierarchy (Dominant) - Now 2 of 4 columns = 50% */}
          <div className="lg:col-span-2 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              {/* Logo - Larger and more prominent */}
              <div className="w-fit">
                <Link href="/" aria-label="Brik home" className="block">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative h-10 w-auto"
                  >
                    <Image
                      src="/images/new/logo1.jpg"
                      alt="Brik Logo"
                      width={160}
                      height={40}
                      className="h-10 w-auto object-contain"
                      priority
                      sizes="160px"
                      style={{ width: "auto", height: "40px" }}
                    />
                  </motion.div>
                </Link>
              </div>

              {/* Description - Higher prominence with better spacing */}
              <p className="text-gray-300 leading-relaxed text-base max-w-md">
                The future of real-world asset swapping. Trade crypto for
                tokenized commodities seamlessly and securely.
              </p>

              {/* Primary CTA - Principle 4: Contrast */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-fit"
              >
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-2 px-6 py-3
                 
                    rounded-lg  
                    hover:shadow-[0_0_30px_rgba(106,13,173,0.5)]
                    focus:outline-none focus:ring-2 focus:ring-[#6A0DAD] text-xl font-burbank bg-[#ffd700] text-[#1c1c1c] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]
                    transition-all duration-200"
                  aria-label={cta.text}
                >
                  {cta.text}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </motion.div>

              {/* Social Links & Trust Indicators Group - Principle 6: Proximity */}
              <div className="space-y-6">
                {/* Social Links - Enhanced prominence */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-3">
                    Follow Us
                  </p>
                  <div className="flex items-center gap-3">
                    {socials.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-11 h-11 rounded-full glass flex items-center justify-center
                          hover:border-gold/50 transition-all group
                          focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
                        aria-label={`Follow us on ${social.name}`}
                      >
                        <social.icon
                          className="w-5 h-5 text-gold/70 group-hover:text-gold transition-colors"
                          aria-hidden="true"
                        />
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4">
                  {trustIndicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-gray-400"
                    >
                      <indicator.icon
                        className="w-4 h-4 text-gold/60"
                        aria-hidden="true"
                      />
                      <span>{indicator.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup - Lower in hierarchy */}
              <NewsletterSignup />
            </motion.div>
          </div>

          {/* Navigation Sections - Desktop - Now 2 columns instead of 3 */}
          <div className="hidden lg:contents">
            {footerSections.map((section, index) => (
              <motion.nav
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                aria-label={`${section.title} links`}
              >
                {/* Section title - Principle 1: Hierarchy */}
                <h4
                  className={`font-semibold mb-5 ${
                    section.importance === "high"
                      ? "text-white text-base"
                      : "text-gray-300 text-sm"
                  }`}
                >
                  {section.title}
                </h4>

                <ul className="space-y-3.5">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-gold transition-colors text-sm inline-block
                          focus:outline-none focus:text-gold focus:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.nav>
            ))}
          </div>

          {/* Navigation Sections - Mobile Accordion - Principle 2: Progressive Disclosure */}
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {footerSections.map((section, index) => (
                <MobileAccordionSection
                  key={index}
                  section={section}
                  index={index}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Divider with gradient */}
        <div
          className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"
          aria-hidden="true"
        />

        {/* Bottom Section - Legal & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-gray-500">© 2025 Brik. All rights reserved.</div>

          <nav aria-label="Legal links" className="flex items-center gap-6">
            <Link
              href={ROUTE_MAP["Privacy Policy"]}
              className="text-gray-500 hover:text-gold transition-colors
                focus:outline-none focus:text-gold focus:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href={ROUTE_MAP["Terms of Service"]}
              className="text-gray-500 hover:text-gold transition-colors
                focus:outline-none focus:text-gold focus:underline"
            >
              Terms of Service
            </Link>
            <Link
              href={ROUTE_MAP["Cookie Policy"]}
              className="text-gray-500 hover:text-gold transition-colors
                focus:outline-none focus:text-gold focus:underline"
            >
              Cookie Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
