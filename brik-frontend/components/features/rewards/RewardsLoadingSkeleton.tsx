"use client";

export default function RewardsLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Section Skeleton */}
      <div className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 md:p-8 animate-pulse">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-xl" />
              <div className="space-y-2">
                <div className="h-8 w-32 bg-gray-700 rounded" />
                <div className="h-4 w-24 bg-gray-700 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-700 rounded-full" />
              <div className="h-4 w-48 bg-gray-700 rounded" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-700 rounded-xl" />
            <div className="h-10 w-32 bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Mystery Boxes Skeleton */}
      <div className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 md:p-8 animate-pulse">
        <div className="h-6 w-32 bg-gray-700 rounded mb-6" />
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-6 w-24 bg-gray-700 rounded mb-4" />
            <div className="h-48 bg-gray-700 rounded" />
          </div>
        ))}
      </div>

      {/* Bottom Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-700 rounded" />
              <div className="h-4 w-3/4 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
