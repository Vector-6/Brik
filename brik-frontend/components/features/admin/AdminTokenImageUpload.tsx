/**
 * AdminTokenImageUpload Component
 * Handles image upload for token management
 */

import { useRef } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface AdminTokenImageUploadProps {
  imagePreview: string;
  imageFile: File | null;
  error?: string;
  onImageChange: (file: File | null) => void;
}

export default function AdminTokenImageUpload({
  imagePreview,
  imageFile,
  error,
  onImageChange,
}: AdminTokenImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        onImageChange(null);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        onImageChange(null);
        return;
      }

      onImageChange(file);
    }
  };

  return (
    <div className="md:col-span-2 space-y-2">
      <label className="block text-sm font-medium text-white/80">
        Token Image *
      </label>

      <div className="flex gap-4 items-start">
        {/* Image Preview */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Token preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-white/40" />
            )}
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>{imageFile ? "Change Image" : "Upload Image"}</span>
          </button>
          <p className="text-xs text-white/60">
            Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
          </p>
          {imageFile && (
            <p className="text-xs text-green-400">Selected: {imageFile.name}</p>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
