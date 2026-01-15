'use client';

import { useMemo, useState } from "react";
import type { FAQSection as FAQSectionType } from "../types";
import { FAQAccordionItem } from "./FAQAccordionItem";

interface FAQSectionProps {
  section: FAQSectionType;
  accentColor?: string;
}

export function FAQSection({ section, accentColor = "#6107e0" }: FAQSectionProps) {
  const defaultOpen = section.items[0]?.id ?? null;
  const [openItemId, setOpenItemId] = useState<string | null>(defaultOpen);

  const items = useMemo(() => section.items, [section.items]);

  return (
    <section
      id={section.id}
      className="relative scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_65px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-colors sm:p-6 lg:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase nothingclass[0.35em] text-[#ffd700]">
            {section.categoryId}
          </span>
          <h3 className="text-2xl font-semibold text-white md:text-3xl">
            {section.title}
          </h3>
          {section.description && (
            <p className="max-w-2xl text-sm text-gray-300 md:text-base">
              {section.description}
            </p>
          )}
        </div>
        {section.highlight && (
          <div className="rounded-2xl border border-white/10 bg-[#6107e0]/12 px-4 py-3 text-sm font-semibold text-[#ffd700] shadow-[0_14px_45px_rgba(97,7,224,0.22)]">
            {section.highlight}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <FAQAccordionItem
            key={item.id}
            item={item}
            index={index}
            isOpen={openItemId === item.id}
            onToggle={() =>
              setOpenItemId((current) => (current === item.id ? null : item.id))
            }
          />
        ))}
      </div>

      <div
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at top left, ${accentColor}22, transparent 60%)`,
        }}
        className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 opacity-50 blur-3xl"
      />
    </section>
  );
}
