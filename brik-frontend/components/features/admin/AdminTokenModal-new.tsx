/**
 * AdminTokenModal Component (Refactored)
 * Modal for adding/editing tokens with image upload support
 */

import { useState } from "react";
import { X, Save } from "lucide-react";
import type { AdminToken } from "@/lib/types/admin.types";
import AdminTokenImageUpload from "./AdminTokenImageUpload";
import AdminTokenAddresses from "./AdminTokenAddresses";

interface AdminTokenModalProps {
  token: AdminToken | null;
  onClose: () => void;
  onSave: (token: AdminToken, imageFile?: File) => void;
}

export default function AdminTokenModal({
  token,
  onClose,
  onSave,
}: AdminTokenModalProps) {
  const [formData, setFormData] = useState<AdminToken>(
    token || {
      _id: "",
      symbol: "",
      name: "",
      decimals: 18,
      coingeckoId: "",
      addresses: {},
      image: "",
      type: "crypto",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(token?.image || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setErrors((prev) => ({ 
        ...prev, 
        image: file === null && !imagePreview 
          ? "Please select a valid image file" 
          : "Image size must be less than 5MB" 
      }));
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: "" }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.symbol) newErrors.symbol = "Symbol is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.coingeckoId) newErrors.coingeckoId = "CoinGecko ID is required";
    if (!imagePreview && !imageFile) newErrors.image = "Image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        ...formData,
        updatedAt: new Date().toISOString(),
      },
      imageFile || undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#130d26] p-8 shadow-[0_30px_80px_rgba(97,7,224,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-burbank">
            {token ? "Edit Token" : "Add New Token"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Symbol */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Symbol *
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    symbol: e.target.value.toUpperCase(),
                  }));
                  setErrors((prev) => ({ ...prev, symbol: "" }));
                }}
                required
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.symbol ? "border-red-500" : "border-white/10"
                } bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30`}
                placeholder="e.g., USDC"
              />
              {errors.symbol && (
                <p className="text-xs text-red-400">{errors.symbol}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                required
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.name ? "border-red-500" : "border-white/10"
                } bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30`}
                placeholder="e.g., USD Coin"
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Decimals */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Decimals *
              </label>
              <input
                type="number"
                value={formData.decimals}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    decimals: parseInt(e.target.value),
                  }))
                }
                required
                min="0"
                max="18"
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as "crypto" | "rwa",
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
              >
                <option value="crypto">Crypto</option>
                <option value="rwa">RWA</option>
              </select>
            </div>

            {/* CoinGecko ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                CoinGecko ID *
              </label>
              <input
                type="text"
                value={formData.coingeckoId}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    coingeckoId: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, coingeckoId: "" }));
                }}
                required
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.coingeckoId ? "border-red-500" : "border-white/10"
                } bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30`}
                placeholder="e.g., usd-coin"
              />
              {errors.coingeckoId && (
                <p className="text-xs text-red-400">{errors.coingeckoId}</p>
              )}
            </div>

            {/* Image Upload */}
            <AdminTokenImageUpload
              imagePreview={imagePreview}
              imageFile={imageFile}
              error={errors.image}
              onImageChange={handleImageChange}
            />
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#6107e0] focus:ring-2 focus:ring-[#6107e0]/30"
              />
              Active
            </label>
          </div>

          {/* Addresses Section */}
          <AdminTokenAddresses
            addresses={formData.addresses}
            onAddressesChange={(addresses) =>
              setFormData((prev) => ({ ...prev, addresses }))
            }
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#6107e0] to-[#8f48ff] text-white font-medium shadow-[0_0_20px_rgba(97,7,224,0.3)] hover:shadow-[0_0_30px_rgba(97,7,224,0.5)] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{token ? "Update" : "Create"} Token</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
