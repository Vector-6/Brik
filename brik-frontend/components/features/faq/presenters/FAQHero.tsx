'use client';

import { useId } from "react";
import { Search } from "lucide-react";

interface FAQHeroProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  totalMatches: number;
}

export function FAQHero({ searchValue, onSearchChange, totalMatches }: FAQHeroProps) {
  const searchId = useId();

  return (
    <section className="relative z-10 flex flex-col gap-8 text-gray-100 sm:gap-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="space-y-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[0.65rem] font-semibold uppercase nothingclass[0.3em] text-[#ffd700] sm:px-4 sm:text-xs">
            Quick Answers
          </span>
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl animate-gradient"
              style={{
                background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              <span className="block">Brik FAQs</span>
              <span className="block">
                Your questions answered
              </span>
            </h1>
            <p className="max-w-2xl text-sm text-gray-300 sm:text-base md:text-lg">
              Explore the most asked questions about onboarding, pricing, security, and trading on
              Brik. Use the intelligent search or jump into a topic to get immediate clarity.
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-gray-300 shadow-[0_16px_50px_rgba(0,0,0,0.3)] backdrop-blur sm:px-5 lg:max-w-sm lg:flex-col lg:items-start lg:text-right">
          <div className="text-left ">
            <p className="text-[0.65rem] uppercase nothingclass[0.28em] text-[#ffd700] sm:text-xs">
              Need more help?
            </p>
            <p className="mt-2 text-base font-semibold text-white sm:text-lg">
              Talk to our support crew
            </p>
          </div>
          <p className="text-xs text-gray-400 sm:text-sm lg:text-right">
            <span className="font-medium text-white">Email</span>
            <a
              className="ml-2 font-medium text-[#ffd700] underline-offset-2 hover:text-[#ffd700]/80 hover:underline"
              href="mailto:support@brik.gg"
            >
              support@brik.gg
            </a>
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#1c1c1c]/70 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-6 md:p-8">
        <label htmlFor={searchId} className="sr-only">
          Search FAQs
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-gray-400 sm:block" />
            <input
              id={searchId}
              type="search"
              placeholder="Search payments, onboarding, limits..."
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-gray-100 shadow-inner outline-none transition duration-300 ease-out focus:border-[#6107e0]/70 focus:shadow-[0_22px_60px_rgba(97,7,224,0.22)] focus:ring-0 sm:pl-12 sm:text-base md:py-4 md:text-lg"
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs text-gray-300 sm:px-5 sm:text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6107e0]/25 text-sm font-semibold text-[#ffd700] sm:h-9 sm:w-9">
              {totalMatches}
            </span>
            <div className="leading-tight">
              <p className="font-medium text-white">Curated answers</p>
              <p className="text-[0.65rem] text-gray-400 sm:text-xs">Updated weekly by the team</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>
            Showing <span className="font-semibold text-[#ffd700]">{totalMatches}</span> results that
            match your query or selected topic.
          </p>
          <p className="hidden text-[0.65rem] uppercase nothingclass[0.28em] text-gray-500 sm:block">
            Built for traders · Compliance ready · 24/5 desk
          </p>
        </div>
      </div>
    </section>
  );
}
