/**
 * AdminDashboardStats Component
 * Displays statistics cards for token counts
 */

import { Coins } from "lucide-react";
import type { AdminToken } from "@/lib/types/admin.types";

interface AdminDashboardStatsProps {
  tokens: AdminToken[];
}

export default function AdminDashboardStats({ tokens }: AdminDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Tokens"
        value={tokens.length}
        icon={<Coins className="w-5 h-5" />}
      />
      <StatCard
        title="RWA Tokens"
        value={tokens.filter((t) => t.type === "rwa").length}
        icon={<Coins className="w-5 h-5" />}
      />
      <StatCard
        title="Crypto Tokens"
        value={tokens.filter((t) => t.type === "crypto").length}
        icon={<Coins className="w-5 h-5" />}
      />
      <StatCard
        title="Active"
        value={tokens.filter((t) => t.isActive).length}
        icon={<Coins className="w-5 h-5" />}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode 
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#130d26]/80 p-6 shadow-[0_10px_40px_rgba(97,7,224,0.1)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/60 text-sm font-medium">{title}</div>
        <div className="text-[#6107e0]">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white font-burbank">{value}</div>
    </div>
  );
}
