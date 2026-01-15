/**
 * AdminTokenFormFields Component
 * Basic form fields for token creation/editing
 */

interface AdminTokenFormFieldsProps {
  formData: {
    symbol: string;
    name: string;
    decimals: number;
    type: string;
    coingeckoId: string;
    isActive: boolean;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
  onErrorClear: (field: string) => void;
}

export default function AdminTokenFormFields({
  formData,
  errors,
  onFieldChange,
  onErrorClear,
}: AdminTokenFormFieldsProps) {
  return (
    <>
      {/* Symbol */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Symbol *
        </label>
        <input
          type="text"
          value={formData.symbol}
          onChange={(e) => {
            onFieldChange("symbol", e.target.value.toUpperCase());
            onErrorClear("symbol");
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
        <label className="block text-sm font-medium text-white/80">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            onFieldChange("name", e.target.value);
            onErrorClear("name");
          }}
          required
          className={`w-full px-4 py-2.5 rounded-lg border ${
            errors.name ? "border-red-500" : "border-white/10"
          } bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30`}
          placeholder="e.g., USD Coin"
        />
        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
      </div>

      {/* Decimals */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Decimals *
        </label>
        <input
          type="number"
          value={formData.decimals}
          onChange={(e) => onFieldChange("decimals", parseInt(e.target.value))}
          required
          min="0"
          max="18"
          className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">Type *</label>
        <select
          value={formData.type}
          onChange={(e) => onFieldChange("type", e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
        >
          <option value="crypto">Crypto</option>
          <option value="rwa">RWA</option>
          <option value="custom">Custom</option>
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
            onFieldChange("coingeckoId", e.target.value);
            onErrorClear("coingeckoId");
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
    </>
  );
}
