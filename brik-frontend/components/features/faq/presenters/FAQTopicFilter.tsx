'use client';

import type { FAQTopic } from "../types";

interface FAQTopicFilterProps {
  topics: FAQTopic[];
  activeTopicId: string;
  onTopicChange: (topicId: string) => void;
  onReset: () => void;
  canReset: boolean;
}

export function FAQTopicFilter({
  topics,
  activeTopicId,
  onTopicChange,
  onReset,
  canReset,
}: FAQTopicFilterProps) {
  return (
    <nav className="relative z-10" aria-label="FAQ topics">
      <div className="mb-4 flex items-center justify-between gap-3 text-[0.65rem] font-semibold uppercase nothingclass[0.2em] text-gray-400 sm:text-xs lg:hidden">
        <p>Filter by topic</p>
        <button
          type="button"
          onClick={onReset}
          disabled={!canReset}
          className={`font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] ${
            canReset
              ? "text-gray-200 hover:text-[#ffd700]"
              : "cursor-not-allowed text-gray-600"
          }`}
        >
          Reset
        </button>
      </div>

      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {topics.map((topic) => {
            const isActive = topic.id === activeTopicId;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => onTopicChange(topic.id)}
                className={`group inline-flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] ${
                  isActive
                    ? "border-[#6107e0]/70 bg-[#6107e0]/25 text-white shadow-[0_15px_45px_rgba(97,7,224,0.25)]"
                    : "border-white/10 bg-white/[0.06] text-gray-200 hover:border-[#ffd700]/40 hover:text-white"
                }`}
                aria-pressed={isActive}
              >
                <span className="truncate text-[0.65rem] uppercase nothingclass[0.2em] text-[#ffd700] sm:text-xs">
                  {topic.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="hidden lg:sticky lg:top-24 lg:flex lg:h-fit lg:flex-col lg:gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-semibold uppercase nothingclass[0.28em] text-gray-300">
              Topics
            </h2>
            <p className="mt-1 text-[0.7rem] text-gray-500">
              Choose a focus area to narrow the answers.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            className={`text-[0.65rem] font-semibold uppercase nothingclass[0.28em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] ${
              canReset ? "text-[#ffd700] hover:text-[#ffd700]/80" : "cursor-not-allowed text-gray-600"
            }`}
          >
            Reset
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {topics.map((topic) => {
            const isActive = topic.id === activeTopicId;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => onTopicChange(topic.id)}
                aria-pressed={isActive}
                title={topic.description}
                className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] ${
                  isActive
                    ? "border-[#6107e0]/70 bg-[#6107e0]/25 text-white shadow-[0_12px_36px_rgba(97,7,224,0.25)]"
                    : "border-white/10 bg-white/[0.05] text-gray-200 hover:border-[#ffd700]/45 hover:bg-white/[0.08]"
                }`}
                data-active={isActive}
              >
                <span className="nothingclass[0.18em] text-[0.7rem] uppercase text-[#ffd700]">
                  {topic.label}
                </span>
                {topic.badge && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] uppercase nothingclass[0.25em] text-[#ffd700]">
                    {topic.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[0.7rem] text-gray-500">
          Hover a pill to preview its focus. Combine with search for laser-focused answers.
        </p>
      </aside>
    </nav>
  );
}
