'use client';

interface FAQEmptyStateProps {
  searchValue: string;
  onReset: () => void;
}

export function FAQEmptyState({ searchValue, onReset }: FAQEmptyStateProps) {
  return (
    <div className="relative z-10 mt-16 flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-12 text-center shadow-[0_32px_120px_rgba(0,0,0,0.4)] md:px-12">
      <span className="rounded-full border border-[#6107e0]/30 bg-[#6107e0]/15 px-4 py-2 text-xs font-semibold uppercase nothingclass[0.35em] text-[#ffd700]">
        No results
      </span>
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-white md:text-3xl">
          We couldn&apos;t find any matches for “{searchValue}”
        </h3>
        <p className="text-base text-gray-300 md:text-lg">
          Try adjusting your search terms or explore one of the core topics below. Our support
          team is also available 24/5 if you need tailored guidance.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full bg-[#6107e0] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(97,7,224,0.35)] transition hover:bg-[#6107e0]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c]"
      >
        Clear search
      </button>
    </div>
  );
}
