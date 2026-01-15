/**
 * SuccessModal Component
 * 
 * A beautiful animated modal for displaying success messages
 * Features animated checkmark and confetti effect
 */

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: "✅" | "🎉" | "🚀" | "✨";
  duration?: number;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  icon = "✅",
  duration = 3000,
}: SuccessModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scaleIn">
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6107e0]/20 via-transparent to-[#6107e0]/10 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          ✕
        </button>

        {/* Content */}
        <div className="relative flex flex-col items-center text-center space-y-4">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#6107e0]/30 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#6107e0] to-[#8b5cf6] text-4xl animate-bounce">
              {icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white">{title}</h3>

          {/* Message */}
          <p className="text-white/70 text-base">{message}</p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6107e0] to-[#8b5cf6] hover:from-[#7c3aed] hover:to-[#9d6bff] text-white font-medium transition-all duration-300 shadow-lg shadow-[#6107e0]/30 hover:shadow-[#6107e0]/50"
          >
            Got it!
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-1 -left-1 w-20 h-20 bg-[#6107e0]/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-[#8b5cf6]/10 rounded-full blur-xl animate-pulse delay-150" />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
