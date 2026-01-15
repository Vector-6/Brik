import Link from "next/link";
import { Mail, MessageSquare, Clock3, ShieldCheck } from "lucide-react";
import { GradientText } from "@/components/ui/common";
import Image from "next/image";

/**
 * ContactHero Component
 *
 * Hero section for the contact page with visual consistency to About and Landing pages.
 * Features:
 * - Grid background pattern with purple radial gradient
 * - Large, bold typography with brand color accents
 * - Dual-purpose messaging (general contact + RWA suggestions)
 * - Accessible, semantic HTML structure
 */
export default function ContactHero() {
  return (
    <section
      className="relative isolate min-h-screen overflow-hidden bg-[#1c1c1c]"
      aria-labelledby="contact-hero-heading"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#6107e0]/35 blur-[140px]" />
          <div className="absolute right-[-15%] top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[#6107e0]/30 blur-[160px] md:block" />
        </div>
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,#1c1c1c,rgba(28,28,28,0.7),rgba(28,28,28,0))]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,#1c1c1c,rgba(28,28,28,0.8),rgba(28,28,28,0))]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 pb-24 pt-28 sm:pt-32 lg:flex-row lg:items-center lg:gap-20 lg:px-8 lg:pb-32">
        <div className="flex-1 text-center lg:text-left">
          <span className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.7rem] font-semibold uppercase nothingclass[0.35em] text-[#cabffd] backdrop-blur-sm lg:mx-0">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Contact Brik
          </span>

          <h1
            id="contact-hero-heading"
            className="text-4xl font-semibold nothingclasstight sm:text-5xl lg:text-6xl animate-gradient"
            style={{
              letterSpacing: "-0.02em",
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Let&apos;s Connect and Shape Tokenized Finance
          </h1>

          <p className="mt-6 mx-auto max-w-xl text-lg text-gray-300 sm:text-xl lg:mx-0">
            Whether you&apos;re exploring partnerships, need support, or want to
            champion the next real-world asset, our team is ready to help you
            move fast without the noise.
          </p>

          <p className="mt-4 text-base font-semibold text-[#ffd700] sm:text-lg">
            Your ideas become the roadmap. Let&apos;s make the next launch
            together.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
            <Link
              href="#contact-forms"
              className="group inline-flex w-full items-center justify-center rounded-full bg-[#ffd700] px-6 py-3 text-sm font-semibold uppercase nothingclass[0.22em] text-[#1c1c1c] shadow-[0_12px_40px_rgba(255,215,0,0.25)] transition-all hover:translate-y-[-2px] hover:shadow-[0_16px_60px_rgba(255,215,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd700] sm:w-auto"
            >
              Start the conversation
              <span className="ml-3 h-6 w-6 rounded-full bg-[#1c1c1c] text-[#ffd700] transition-all group-hover:translate-x-1 group-hover:bg-[#1c1c1c]/90 group-hover:text-[#ffd700] flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>

            <Link
              href="/faqs"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase nothingclass[0.22em] text-white transition-colors hover:border-white/30 hover:text-[#ffd700] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6107e0] sm:w-auto"
            >
              Browse FAQs
            </Link>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 text-sm text-gray-300 sm:flex-row sm:gap-8 lg:items-center lg:justify-start lg:text-left">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 font-medium">
                <Clock3 className="h-4 w-4 text-[#ffd700]" aria-hidden="true" />
                Response in under 24 hours
              </span>
            </div>
            <div className="flex items-center gap-3 font-medium">
              <ShieldCheck
                className="h-4 w-4 text-[#6107e0]"
                aria-hidden="true"
              />
              Private &amp; secure communication
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:flex-1 lg:max-w-lg">
          <Image src={"/images/contact-hero.png"} alt="contact-page-hero" aria-hidden height={1080} width={1080}/>
        </div>
      </div>
    </section>
  );
}
