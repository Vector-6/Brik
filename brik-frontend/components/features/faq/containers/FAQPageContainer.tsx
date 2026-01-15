"use client";

import { FAQHero } from "../presenters/FAQHero";
import { FAQTopicFilter } from "../presenters/FAQTopicFilter";
import { FAQSection } from "../presenters/FAQSection";
import { FAQEmptyState } from "../presenters/FAQEmptyState";
import { useFAQContent } from "../hooks/useFAQContent";

export function FAQPageContainer() {
  const {
    topics,
    sections,
    searchValue,
    setSearchValue,
    activeTopicId,
    setActiveTopicId,
    totalMatches,
    hasResults,
    resetFilters,
  } = useFAQContent();

  const canReset = activeTopicId !== "all" || searchValue.trim().length > 0;

  return (
    <main
      className="relative min-h-screen overflow-hidden mt-24 bg-[#1c1c1c] text-gray-100"
      id="main-content"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 hidden h-80 w-80 rounded-full bg-[#6107e0]/20 blur-[140px] sm:block" />
        <div className="absolute -left-16 top-1/3 h-64 w-64 rounded-full bg-[#6107e0]/15 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-[#ffd700]/10 blur-[180px]" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#6107e0]/10 blur-[160px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:gap-14 lg:px-10">
        <FAQHero
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          totalMatches={totalMatches}
        />

        <section className="grid gap-10 lg:grid-cols-[minmax(220px,280px),1fr] lg:items-start xl:grid-cols-[300px,1fr] xl:gap-16">
          <FAQTopicFilter
            topics={topics}
            activeTopicId={activeTopicId}
            onTopicChange={setActiveTopicId}
            onReset={resetFilters}
            canReset={canReset}
          />

          <div className="space-y-10">
            {hasResults ? (
              sections.map((section) => (
                <FAQSection key={section.id} section={section} />
              ))
            ) : (
              <FAQEmptyState searchValue={searchValue} onReset={resetFilters} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
