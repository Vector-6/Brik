/**
 * AdminTokenAddresses Component
 * Manages chain addresses for tokens
 */

import { useState } from "react";
import { X } from "lucide-react";

interface AdminTokenAddressesProps {
  addresses: Record<string, string>;
  onAddressesChange: (addresses: Record<string, string>) => void;
}

export default function AdminTokenAddresses({
  addresses,
  onAddressesChange,
}: AdminTokenAddressesProps) {
  const [newChainId, setNewChainId] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const handleAddAddress = () => {
    if (newChainId && newAddress) {
      onAddressesChange({
        ...addresses,
        [newChainId]: newAddress,
      });
      setNewChainId("");
      setNewAddress("");
    }
  };

  const handleRemoveAddress = (chainId: string) => {
    const newAddresses = { ...addresses };
    delete newAddresses[chainId];
    onAddressesChange(newAddresses);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-white/80">
        Chain Addresses
      </label>

      {/* Existing Addresses */}
      <div className="space-y-2">
        {Object.entries(addresses || {}).map(([chainId, address]) => (
          <div
            key={chainId}
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex-1">
              <div className="text-xs text-white/60 mb-1">
                Chain ID: {chainId}
              </div>
              <div className="text-sm text-white/80 font-mono truncate">
                {address}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveAddress(chainId)}
              className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Address */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Chain ID (e.g., 1)"
          value={newChainId}
          onChange={(e) => setNewChainId(e.target.value)}
          className="w-32 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
        />
        <input
          type="text"
          placeholder="Contract Address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
        />
        <button
          type="button"
          onClick={handleAddAddress}
          className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
