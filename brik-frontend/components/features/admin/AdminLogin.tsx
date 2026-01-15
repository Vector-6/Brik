"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, LogIn, Eye, EyeOff, Shield, Mail } from "lucide-react";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";

/**
 * AdminLogin Component
 * 
 * Secure login form for admin panel access
 * Features:
 * - Glassmorphism design matching the platform theme
 * - Password visibility toggle
 * - Client-side validation
 * - Accessible form with proper ARIA attributes
 * - Real API integration with JWT authentication
 * - Auto-redirect if already logged in
 */
export default function AdminLogin() {
  const router = useRouter();
  const { login, isLoading, error: authError, isAuthenticated, isInitialized } = useAdminAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState("");

  // ============================================================================
  // Auto-redirect if already authenticated
  // ============================================================================
  
  useEffect(() => {
    // Only check after initialization to avoid race conditions
    if (isInitialized && isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoginError("");

    // Validation
    const newErrors: Record<string, string> = {};
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call login API
    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      // Redirect to dashboard on success
      router.push("/admin/dashboard");
    } else {
      // Show error message
      setLoginError(result.error || "Login failed. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setLoginError("");
  };

  // ============================================================================
  // Show loading while checking if already authenticated
  // ============================================================================
  
  if (!isInitialized) {
    return (
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6107e0] to-[#8f48ff] mb-4 shadow-[0_0_40px_rgba(97,7,224,0.4)]">
            <Shield className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-white font-burbank mb-2">
            Admin Access
          </h1>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#130d26]/80 p-8 shadow-[0_30px_80px_rgba(97,7,224,0.18)] backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#6107e0] mb-4" />
            <p className="text-white/60 text-sm">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo/Title Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6107e0] to-[#8f48ff] mb-4 shadow-[0_0_40px_rgba(97,7,224,0.4)]">
          <Shield className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-white font-burbank mb-2">
          Admin Access
        </h1>
        <p className="text-white/60 text-sm">
          Sign in to manage the Brik platform
        </p>
      </div>

      {/* Login Form Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#130d26]/80 p-8 shadow-[0_30px_80px_rgba(97,7,224,0.18)] backdrop-blur-sm">
        {/* Gradient Overlay */}
        <div
          className="absolute inset-x-0 -top-24 h-32 bg-gradient-to-b from-[#6107e0]/35 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="admin-email"
              className="block text-sm font-medium text-white/80"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/40" aria-hidden="true" />
              </div>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full rounded-xl border ${
                  errors.email ? 'border-red-500/50' : 'border-white/10'
                } bg-white/5 pl-12 pr-4 py-3.5 px-3 text-white placeholder-white/40 transition-all duration-200 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30 disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="admin@brik.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-sm text-red-400" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-white/80"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/40" aria-hidden="true" />
              </div>
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full rounded-xl border ${
                  errors.password ? 'border-red-500/50' : 'border-white/10'
                } bg-white/5 pl-12 pr-12 py-3.5 px-3 text-white placeholder-white/40 transition-all duration-200 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30 disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/60 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-red-400" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Login Error */}
          {(loginError || authError) && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400" role="alert">
              {loginError || authError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6107e0] to-[#8f48ff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(97,7,224,0.4)] transition-all duration-200 hover:shadow-[0_0_40px_rgba(97,7,224,0.6)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/50 focus:ring-offset-2 focus:ring-offset-[#130d26] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" aria-hidden="true" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-white/40">
          Protected area. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
