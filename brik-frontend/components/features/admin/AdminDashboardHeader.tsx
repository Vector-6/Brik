/**
 * AdminDashboardHeader Component
 * Header section with title and logout button
 */

import { Shield, LogOut } from "lucide-react";

interface AdminDashboardHeaderProps {
  onLogout: () => void;
}

export default function AdminDashboardHeader({ onLogout }: AdminDashboardHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#6107e0] to-[#8f48ff] shadow-[0_0_30px_rgba(97,7,224,0.4)]">
            <Shield className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-burbank">
              Admin Dashboard
            </h1>
            <p className="text-sm text-white/60">
              Manage platform tokens and settings
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
