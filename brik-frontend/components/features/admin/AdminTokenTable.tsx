/**
 * AdminTokenTable Component
 * Table displaying token list with actions
 */

import { Edit2, Trash2 } from "lucide-react";
import type { AdminToken } from "@/lib/types/admin.types";

interface AdminTokenTableProps {
  tokens: AdminToken[];
  onEdit: (token: AdminToken) => void;
  onDelete: (tokenId: string) => void;
}

export default function AdminTokenTable({
  tokens,
  onEdit,
  onDelete,
}: AdminTokenTableProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#130d26]/80 shadow-[0_20px_60px_rgba(97,7,224,0.15)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                Token
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                Symbol
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                Decimals
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                Chains
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                  No tokens found
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <TokenRow
                  key={token._id}
                  token={token}
                  onEdit={() => onEdit(token)}
                  onDelete={() => onDelete(token._id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Token Row Component
function TokenRow({
  token,
  onEdit,
  onDelete,
}: {
  token: AdminToken;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={token.image}
            alt={token.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-white font-medium">{token.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-white/80">{token.symbol}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
            token.type === "rwa"
              ? "bg-purple-500/20 text-purple-300"
              : "bg-blue-500/20 text-blue-300"
          }`}
        >
          {token.type.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 text-white/80">{token.decimals}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
            token.isActive
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {token.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4 text-white/80">
        {Object.keys(token.addresses || {}).length}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Edit token"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
            aria-label="Delete token"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
