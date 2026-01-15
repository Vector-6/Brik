"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { GradientText } from '@/components/ui/common';
import { submitRwaSuggestion, validateRwaData } from "@/lib/api/endpoints/mail";
import { getErrorMessage } from "@/lib/api/client";
import type { FormSubmissionStatus, RwaCategory } from "@/lib/api/types/mail.types";

/**
 * RWASuggestion Component
 *
 * Specialized form for users to suggest new Real-World Assets.
 * Features:
 * - Category selection for asset types
 * - Detailed rationale and market data fields
 * - Validation with helpful error messages
 * - Success confirmation with visual feedback
 * - Accessible form design with ARIA support
 */
type RWASuggestionProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
};

export default function RWASuggestion({
  isExpanded,
  onExpand,
  onCollapse,
}: RWASuggestionProps) {
  const [formData, setFormData] = useState({
    email: "",
    assetName: "",
    category: "",
    assetDescription: "",
    marketSize: "",
    whyThisAsset: "",
  });
  const [status, setStatus] = useState<FormSubmissionStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");

  const categories = [
    { value: "", label: "Select a category", disabled: true },
    { value: "Commodities (Gold, Silver, etc.)", label: "Commodities (Gold, Silver, etc.)" },
    { value: "Real Estate", label: "Real Estate" },
    { value: "Treasury Bonds", label: "Treasury Bonds" },
    { value: "Carbon Credits", label: "Carbon Credits" },
    { value: "Renewable Energy", label: "Renewable Energy" },
    { value: "Art & Collectibles", label: "Art & Collectibles" },
    { value: "Other", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using imported function
    const validationErrors = validateRwaData({
      email: formData.email,
      assetName: formData.assetName,
      category: formData.category as RwaCategory,
      assetDescription: formData.assetDescription,
      marketSize: formData.marketSize,
      whyThisAsset: formData.whyThisAsset,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");
    setSubmitError("");

    try {
      await submitRwaSuggestion({
        email: formData.email.trim(),
        assetName: formData.assetName.trim(),
        category: formData.category as RwaCategory,
        assetDescription: formData.assetDescription.trim(),
        marketSize: formData.marketSize.trim() || undefined,
        whyThisAsset: formData.whyThisAsset.trim(),
      });

      setStatus("success");
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          email: "",
          assetName: "",
          category: "",
          assetDescription: "",
          marketSize: "",
          whyThisAsset: "",
        });
        setErrors({});
        setStatus("idle");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setSubmitError(getErrorMessage(error));
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setSubmitError("");
      }, 5000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isFieldValid = (field: keyof typeof formData) => {
    const value = formData[field].trim();
    if (!value || errors[field]) {
      return false;
    }

    if (field === "assetDescription") {
      return value.length >= 20;
    }

    if (field === "whyThisAsset") {
      return value.length >= 30;
    }

    return true;
  };

  const collapsedView = (
    <button
      type="button"
      onClick={() => {
        setErrors({});
        onExpand();
      }}
      aria-label="Open RWA suggestion form"
      className="relative flex h-full min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#ffd700]/25 bg-[#2d250e]/80 px-4 py-8 shadow-[0_22px_60px_rgba(255,215,0,0.1)] transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-[#ffd700]/60 cursor-pointer lg:min-h-[520px]"
    >
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#2d250e] via-transparent to-transparent opacity-70"
        aria-hidden="true"
      />
      <span className="relative text-base font-semibold uppercase nothingclass[0.4em] text-[#fce67b]/80 lg:hidden">
        Suggestion
      </span>
      <span
        className="relative hidden text-4xl font-semibold uppercase nothingclass[0.45em] text-[#fce67b]/80 lg:block xl:text-5xl"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        Suggestion
      </span>
      <span className="sr-only">Tap to open the RWA suggestion form</span>
    </button>
  );

  const expandedView = (
    <div className="relative overflow-hidden rounded-3xl border border-[#ffd700]/25 bg-[#2d250e]/80 p-8 md:p-12 shadow-[0_30px_80px_rgba(255,215,0,0.14)] transition-transform duration-300">
      <div
        className="absolute inset-x-0 -top-24 h-32 bg-gradient-to-b from-[#ffd700]/30 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="relative mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ffd700]/15 px-4 py-2 text-xs font-semibold uppercase nothingclass[0.25em] text-[#fce67b]">
            Suggestion
          </div>
          <div>
            <h2 className="text-2xl font-semibold md:text-[28px]">
              <GradientText preset="purple" animate="flow">Suggest an RWA</GradientText>
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/70 md:text-base">
              Share the asset you&apos;d love to see tokenized next and why it
              deserves a spot on Brik.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrors({});
            onCollapse();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-[#ffd700]/30 px-3 py-1.5 text-xs font-semibold uppercase nothingclass[0.18em] text-[#fce67b] transition-colors hover:bg-[#ffd700]/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
      </div>

      {status === "success" ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#ffd700]/30 bg-[#30260f]/90 p-10 text-center shadow-[0_24px_60px_rgba(255,215,0,0.2)]">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ffd700]/15">
              <Sparkles
                className="h-10 w-10 text-[#ffd700]"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-semibold">
                <GradientText preset="purple" animate="flow">Suggestion received!</GradientText>
              </h3>
              <p className="text-base leading-7 text-white/70">
                Thanks for shaping the roadmap. We&apos;ll review and reach out
                if we need more detail.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: "",
                  assetName: "",
                  category: "",
                  assetDescription: "",
                  marketSize: "",
                  whyThisAsset: "",
                });
                setErrors({});
                setStatus("idle");
                onCollapse();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#ffd700]/40 px-4 py-2 text-xs font-semibold uppercase nothingclass[0.2em] text-[#fce67b] transition-colors hover:bg-[#ffd700]/10"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative space-y-8" noValidate>
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="rwa-email"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Your Email
              </label>
              <input
                type="email"
                id="rwa-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#ffd700]/40 ${
                  errors.email
                    ? "border-red-500/60"
                    : isFieldValid("email")
                    ? "border-emerald-400/40"
                    : "border-[#ffd700]/25"
                }`}
                placeholder="your@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? "email-error" : undefined
                }
              />
              {errors.email ? (
                <p id="email-error" className="text-sm text-red-400">
                  {errors.email}
                </p>
              ) : (
                isFieldValid("email") && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Valid email.
                  </p>
                )
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rwa-asset-name"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Asset Name
              </label>
              <input
                type="text"
                id="rwa-asset-name"
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#ffd700]/40 ${
                  errors.assetName
                    ? "border-red-500/60"
                    : isFieldValid("assetName")
                    ? "border-emerald-400/40"
                    : "border-[#ffd700]/25"
                }`}
                placeholder="e.g., Tokenized Farmland, Lithium Futures"
                aria-invalid={!!errors.assetName}
                aria-describedby={
                  errors.assetName ? "asset-name-error" : undefined
                }
              />
              {errors.assetName ? (
                <p id="asset-name-error" className="text-sm text-red-400">
                  {errors.assetName}
                </p>
              ) : (
                isFieldValid("assetName") && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Identifiable asset.
                  </p>
                )
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rwa-category"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Category
              </label>
              <select
                id="rwa-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-black/35 px-5 py-4 text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#ffd700]/40 ${
                  errors.category
                    ? "border-red-500/60"
                    : formData.category
                    ? "border-emerald-400/40"
                    : "border-[#ffd700]/25"
                }`}
                aria-invalid={!!errors.category}
                aria-describedby={
                  errors.category ? "category-error" : undefined
                }
              >
                {categories.map((cat) => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    disabled={cat.disabled}
                    className="bg-[#1c1c1c] text-white"
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p id="category-error" className="text-sm text-red-400">
                  {errors.category}
                </p>
              ) : (
                formData.category && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Category locked in.
                  </p>
                )
              )}
            </div>
          </div>

          <div className="space-y-6 border-t border-[#ffd700]/20 pt-6">
            <div className="space-y-2">
              <label
                htmlFor="rwa-description"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Asset Description
              </label>
              <textarea
                id="rwa-description"
                name="assetDescription"
                value={formData.assetDescription}
                onChange={handleChange}
                rows={4}
                className={`w-full resize-none rounded-2xl border bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#ffd700]/40 ${
                  errors.assetDescription
                    ? "border-red-500/60"
                    : isFieldValid("assetDescription")
                    ? "border-emerald-400/40"
                    : "border-[#ffd700]/25"
                }`}
                placeholder="Key characteristics, trading venue, differentiation..."
                aria-invalid={!!errors.assetDescription}
                aria-describedby={
                  errors.assetDescription ? "description-error" : undefined
                }
              />
              {errors.assetDescription ? (
                <p id="description-error" className="text-sm text-red-400">
                  {errors.assetDescription}
                </p>
              ) : (
                isFieldValid("assetDescription") && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Plenty of context.
                  </p>
                )
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rwa-market-size"
                className="flex items-center gap-2 text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Market Size{" "}
                <span className="text-xs font-normal text-white/40">
                  Optional
                </span>
              </label>
              <input
                type="text"
                id="rwa-market-size"
                name="marketSize"
                value={formData.marketSize}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#ffd700]/25 bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#ffd700]/40"
                placeholder="e.g., $500M annual market, $2.3B market cap"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rwa-rationale"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Why this Asset?
              </label>
              <textarea
                id="rwa-rationale"
                name="whyThisAsset"
                value={formData.whyThisAsset}
                onChange={handleChange}
                rows={5}
                className={`w-full resize-none rounded-2xl border bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#ffd700]/40 ${
                  errors.whyThisAsset
                    ? "border-red-500/60"
                    : isFieldValid("whyThisAsset")
                    ? "border-emerald-400/40"
                    : "border-[#ffd700]/25"
                }`}
                placeholder="Explain the demand drivers, liquidity outlook, and ecosystem fit."
                aria-invalid={!!errors.whyThisAsset}
                aria-describedby={
                  errors.whyThisAsset ? "rationale-error" : undefined
                }
              />
              {errors.whyThisAsset ? (
                <p id="rationale-error" className="text-sm text-red-400">
                  {errors.whyThisAsset}
                </p>
              ) : (
                isFieldValid("whyThisAsset") && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Strong thesis submitted.
                  </p>
                )
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#ffd700] text-base font-semibold text-[#1c1c1c] transition-all duration-300 hover:bg-[#f5d754] hover:shadow-[0_18px_45px_rgba(255,215,0,0.35)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c1c] focus:ring-[#ffd700]/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <span
                  className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-[#1c1c1c]/30 border-t-[#1c1c1c]"
                  aria-hidden="true"
                />
                Submitting
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                Submit Suggestion
              </>
            )}
          </button>

          {/* Error Message */}
          {status === "error" && submitError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">
                {submitError}
              </p>
            </div>
          )}
        </form>
      )}

      <div
        className="pointer-events-none absolute right-[-60px] top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[#ffd700] blur-[120px] opacity-30"
        aria-hidden="true"
      />
    </div>
  );

  return isExpanded ? expandedView : collapsedView;
}
