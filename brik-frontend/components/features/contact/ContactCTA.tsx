import Link from "next/link";
import { Twitter, Linkedin, Mail, ExternalLink, Clock } from "lucide-react";

/**
 * ContactCTA Component
 *
 * Bottom section with alternative contact methods and social links.
 * Features:
 * - Social media links
 * - Email contact
 * - Quick links to other pages
 * - Consistent design with About page CTAs
 */
export default function ContactCTA() {
  return (
    <section
      className="flex items-center justify-center bg-[#1c1c1c] py-20 md:py-28"
      aria-labelledby="contact-cta-heading"
    >
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[28px] border border-white/5 bg-gradient-to-br from-[#221739] via-[#1a132c] to-[#0f0b18] p-10 text-center shadow-[0_18px_50px_rgba(18,7,38,0.55)] sm:p-12">
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6107e0]/20 text-[#cdb9ff] ring-2 ring-[#6107e0]/35">
            <Clock className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2
            id="contact-cta-heading"
            className="text-3xl font-semibold leading-tight text-white sm:text-4xl"
          >
            Discover Opportunities
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Explore a world of real-world assets and innovative financial
            technology. Start your journey by discovering what you can access on
            our platform.
          </p>
          <div className="mt-8 flex w-full flex-col justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6107e0] px-8 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#4d06b3] focus-visible:ring-2 focus-visible:ring-[#ffd700] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] font-burbank"
            >
              Explore Now
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="mailto:hello@brik.gg"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:border-white/40 focus-visible:ring-2 focus-visible:ring-[#ffd700] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] font-burbank"
            >
              Get in touch
            </Link>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-sm text-white/60 sm:flex-row">
            <span className="uppercase nothingclass[0.25em] text-white/45">
              Reach us directly
            </span>
            <div className="flex items-center gap-5">
              <a
                href="https://twitter.com/BrikRWA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 transition hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c]"
                aria-label="Open Brik Twitter"
              >
                <Twitter className="h-4 w-4" aria-hidden="true" />
                <span>Twitter</span>
              </a>
              <a
                href="mailto:hello@brik.gg"
                className="inline-flex items-center gap-2 text-white/70 transition hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c]"
                aria-label="Email Brik"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Email</span>
              </a>
              <a
                href="https://linkedin.com/companybrik-gg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 transition hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c]"
                aria-label="Visit Brik GitHub"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
