/**
 * AdminProtectedRoute Component
 * Protects admin routes from unauthorized access
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, checkAuth } = useAdminAuth();

  useEffect(() => {
    // Only check auth after initialization is complete
    if (isInitialized && !checkAuth()) {
      router.push("/admin");
    }
  }, [isInitialized, isAuthenticated, checkAuth, router]);

  // Show loading while initializing auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1C1C1C] via-[#1A1A24] to-[#1C1C1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#6107e0]" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking auth (after initialization)
  if (!checkAuth()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1C1C1C] via-[#1A1A24] to-[#1C1C1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#6107e0]" />
          <p className="text-white/60">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
