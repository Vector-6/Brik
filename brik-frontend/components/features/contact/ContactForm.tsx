"use client";

import { useState } from "react";
import { Send, CheckCircle2, Sparkles } from "lucide-react";
import { sendContactMessage, validateContactData } from "@/lib/api/endpoints/mail";
import { getErrorMessage } from "@/lib/api/client";
import type { FormSubmissionStatus } from "@/lib/api/types/mail.types";

/**
 * ContactForm Component
 *
 * General contact form for user inquiries and feedback.
 * Features:
 * - Glassmorphism design matching About page cards
 * - Accessible form with proper labels and ARIA attributes
 * - Client-side validation with visual feedback
 * - Success state with confirmation message
 * - Responsive layout for all screen sizes
 */
type ContactFormProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
};

export default function ContactForm({
  isExpanded,
  onExpand,
  onCollapse,
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormSubmissionStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using imported function
    const validationErrors = validateContactData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");
    setSubmitError("");

    try {
      await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setStatus("success");
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "" });
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    if (field === "message") {
      return value.length >= 10;
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
      aria-label="Open contact form"
      className="relative flex h-full min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-[#130d26]/85 px-4 py-8 shadow-[0_22px_60px_rgba(97,7,224,0.15)] transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-[#8f48ff]/60 cursor-pointer lg:min-h-[520px]"
    >
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#130d26] via-transparent to-transparent opacity-70"
        aria-hidden="true"
      />
      <span className="relative text-base font-semibold uppercase nothingclass[0.4em] text-white/70 lg:hidden">
        Contact
      </span>
      <span
        className="relative hidden text-4xl font-semibold uppercase nothingclass[0.45em] text-white/70 lg:block xl:text-5xl"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        Contact
      </span>
      <span className="sr-only">Tap to open the contact form</span>
    </button>
  );

  if (!isExpanded) {
    return collapsedView;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#130d26]/80 p-8 md:p-12 shadow-[0_30px_80px_rgba(97,7,224,0.18)] transition-transform duration-300">
      <div
        className="absolute inset-x-0 -top-24 h-32 bg-gradient-to-b from-[#6107e0]/35 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="relative mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#6107e0]/10 px-4 py-2 text-xs font-semibold uppercase nothingclass[0.25em] text-[#cec1f5]">
            Contact
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white md:text-[28px]">
              Get in Touch
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65 md:text-base">
              Share a few details and we&apos;ll follow up quickly with the
              right teammate.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrors({});
            onCollapse();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase nothingclass[0.18em] text-white/70 transition-colors hover:bg-white/10"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Suggest an RWA
        </button>
      </div>

      {status === "success" ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#1b1034]/90 p-10 text-center shadow-[0_24px_60px_rgba(97,7,224,0.25)]">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2
                className="h-10 w-10 text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-semibold text-white">
                Message sent!
              </h3>
              <p className="text-base leading-7 text-white/70">
                Thanks for reaching out. We&apos;ll get back to you within 24–48
                hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setFormData({ name: "", email: "", subject: "", message: "" });
                setErrors({});
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase nothingclass[0.2em] text-white/80 transition-colors hover:bg-white/10"
            >
              Start another message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative space-y-8" noValidate>
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="contact-name"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Your Name
              </label>
              <input
                type="text"
                id="contact-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#6107e0]/50 ${
                  errors.name
                    ? "border-red-500/60"
                    : isFieldValid("name")
                    ? "border-emerald-400/40"
                    : "border-white/10"
                }`}
                placeholder="John Doe"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name ? (
                <p id="name-error" className="text-sm text-red-400">
                  {errors.name}
                </p>
              ) : (
                isFieldValid("name") && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Looks good.
                  </p>
                )
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="contact-email"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Email Address
              </label>
              <input
                type="email"
                id="contact-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#6107e0]/50 ${
                  errors.email
                    ? "border-red-500/60"
                    : isFieldValid("email")
                    ? "border-emerald-400/40"
                    : "border-white/10"
                }`}
                placeholder="john@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email ? (
                <p id="email-error" className="text-sm text-red-400">
                  {errors.email}
                </p>
              ) : (
                isFieldValid("email") && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Ready for follow-up.
                  </p>
                )
              )}
            </div>
          </div>

          <div className="space-y-6 border-t border-white/10 pt-6">
            <div className="space-y-2">
              <label
                htmlFor="contact-subject"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Subject
              </label>
              <input
                type="text"
                id="contact-subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#6107e0]/50 ${
                  errors.subject
                    ? "border-red-500/60"
                    : isFieldValid("subject")
                    ? "border-emerald-400/40"
                    : "border-white/10"
                }`}
                placeholder="How can we help?"
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />
              {errors.subject ? (
                <p id="subject-error" className="text-sm text-red-400">
                  {errors.subject}
                </p>
              ) : (
                isFieldValid("subject") && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Clear topic.
                  </p>
                )
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="contact-message"
                className="text-[13px] font-medium uppercase nothingclass[0.14em] text-white/55"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className={`w-full resize-none rounded-2xl border bg-black/35 px-5 py-4 text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#6107e0]/50 ${
                  errors.message
                    ? "border-red-500/60"
                    : isFieldValid("message")
                    ? "border-emerald-400/40"
                    : "border-white/10"
                }`}
                placeholder="Share key details to help us prepare."
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message ? (
                <p id="message-error" className="text-sm text-red-400">
                  {errors.message}
                </p>
              ) : (
                isFieldValid("message") && (
                  <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Great context.
                  </p>
                )
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#6107e0] text-base font-semibold text-white transition-all duration-300 hover:bg-[#5410c9] hover:shadow-[0_18px_45px_rgba(97,7,224,0.35)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c1c] focus:ring-[#8f48ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <span
                  className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
                Sending
              </>
            ) : (
              <>
                <Send className="h-5 w-5" aria-hidden="true" />
                Send Message
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

      {/* Decorative accents */}
      <div
        className="pointer-events-none absolute -left-24 bottom-10 h-40 w-40 rounded-full bg-[#6107e0] blur-[120px] opacity-30"
        aria-hidden="true"
      />
    </div>
  );
}
