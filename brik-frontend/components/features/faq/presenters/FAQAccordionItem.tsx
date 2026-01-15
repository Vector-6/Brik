"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "../types";

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

export function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: FAQAccordionItemProps) {
  const tags = useMemo(() => item.tags ?? [], [item.tags]);
  const relatedLinks = useMemo(
    () => item.relatedLinks ?? [],
    [item.relatedLinks]
  );

  return (
    <article
      className={`group rounded-2xl border border-white/10 bg-[#0f0f0f]/70 shadow-[0_16px_55px_rgba(0,0,0,0.32)] transition-colors duration-300 ease-out ${
        isOpen
          ? "border-[#6107e0]/70 bg-[#6107e0]/15"
          : "hover:border-[#ffd700]/40 hover:bg-white/[0.08]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 rounded-2xl px-4 py-4 text-left transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] sm:px-5 md:px-6"
        aria-expanded={isOpen}
        aria-controls={`${item.id}-content`}
        id={`${item.id}-trigger`}
      >
        <div className="flex flex-1 items-start gap-4">
          <span className="mt-1 hidden min-w-[2rem] text-xs font-semibold uppercase nothingclass[0.28em] text-[#ffd700] lg:inline-flex">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-base font-semibold text-white md:text-lg">
            {item.question}
          </span>
        </div>
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? "rotate-180 bg-[#6107e0]/30" : "group-hover:bg-white/20"
          }`}
        >
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>

      <div
        id={`${item.id}-content`}
        role="region"
        aria-labelledby={`${item.id}-trigger`}
        className={`grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-5 pb-5 pt-5 text-sm text-gray-300 sm:px-6 sm:pb-6 sm:pt-6 sm:text-base">
            <p className="leading-relaxed">{item.answer}</p>

            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs uppercase nothingclass[0.2em] text-[#ffd700]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {relatedLinks.length > 0 && (
              <div className="mt-6 flex flex-col gap-2 text-sm">
                {relatedLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 text-[#ffd700] underline-offset-4 transition-colors hover:text-[#ffd700]/80 hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {item.updatedAt && (
              <p className="mt-6 text-[0.65rem] uppercase nothingclass[0.28em] text-gray-500">
                Updated {item.updatedAt}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
