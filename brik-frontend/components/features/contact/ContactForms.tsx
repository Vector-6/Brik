"use client";

import { useState } from "react";

import ContactForm from "./ContactForm";
import RWASuggestion from "./RWASuggestion";

/**
 * ContactForms Component
 *
 * Container component that displays both contact and RWA suggestion forms.
 * Features:
 * - Responsive grid layout (stacks on mobile, side-by-side on desktop)
 * - Consistent spacing and visual hierarchy
 * - Section heading for context
 */
export default function ContactForms() {
  const [activePanel, setActivePanel] = useState<"contact" | "rwa">("contact");

  return (
    <section
      id="contact-forms"
      className="relative overflow-hidden py-20 md:py-32 bg-[#1c1c1c]"
      aria-labelledby="contact-forms-heading"
    >
      <div className="w-full max-w-7xl px-6 mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-xs font-medium uppercase nothingclass[0.25em] text-white/60">
            Guided support
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#ffd700]/80" />
          </p>
          <h2
            id="contact-forms-heading"
            className="mt-5 text-4xl font-semibold text-white md:text-5xl"
          >
            Choose Your Path
          </h2>
          <p className="mt-4 text-base leading-7 text-white/70 md:text-lg">
            Reach out with questions or help us expand the RWA ecosystem—each
            option keeps the journey clear, calm, and actionable.
          </p>
        </div>

        {/* Mobile toggle */}
        <div className="mx-auto mb-10 flex w-full max-w-md items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 p-2 text-xs font-semibold uppercase nothingclass[0.3em] text-white/70 lg:hidden">
          {[
            { id: "contact", label: "Contact" },
            { id: "rwa", label: "Suggestion" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setActivePanel(option.id as "contact" | "rwa")}
              className={`flex-1 rounded-full px-4 py-2 transition-all duration-200 ${
                activePanel === option.id
                  ? `shadow-[0_10px_30px_rgba(97,7,224,0.35)] ${
                      option.id === "rwa"
                        ? "bg-[#ffd700] text-[#1f1f1f]"
                        : "bg-[#6107e0] text-white"
                    }`
                  : "text-white/60 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Forms layout */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch xl:gap-14">
          <div
            className={`transition-[max-width,flex-basis] duration-500 ease-in-out lg:flex-1 ${
              activePanel === "contact"
                ? "block lg:basis-0 lg:max-w-full"
                : "hidden lg:block lg:basis-[150px] lg:max-w-[150px]"
            }`}
          >
            <ContactForm
              isExpanded={activePanel === "contact"}
              onExpand={() => setActivePanel("contact")}
              onCollapse={() => setActivePanel("rwa")}
            />
          </div>

          <div
            className={`transition-[max-width,flex-basis] duration-500 ease-in-out lg:flex-1 ${
              activePanel === "rwa"
                ? "block lg:basis-0 lg:max-w-full"
                : "hidden lg:block lg:basis-[150px] lg:max-w-[150px]"
            }`}
          >
            <RWASuggestion
              isExpanded={activePanel === "rwa"}
              onExpand={() => setActivePanel("rwa")}
              onCollapse={() => setActivePanel("contact")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
