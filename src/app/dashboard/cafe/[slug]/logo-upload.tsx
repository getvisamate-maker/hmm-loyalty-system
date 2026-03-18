"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoUpload({ cafeId, currentLogo }: { cafeId: string; currentLogo: string | null }) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      setIsUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${cafeId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to supabase storage
      const { error: uploadError } = await supabase.storage
        .from('cafe-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cafe-logos')
        .getPublicUrl(filePath);

      // Update cafe record
      const { error: updateError } = await supabase
        .from('cafes')
        .update({ logo_url: publicUrl })
        .eq('id', cafeId);

      if (updateError) {
        throw updateError;
      }

      router.refresh();
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      alert('Error uploading logo! ' + (error?.message || JSON.stringify(error)));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      {currentLogo ? (
        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white">
          <img src={currentLogo} alt="Cafe Logo" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
          <ImageIcon size={32} />
        </div>
      )}
      
      <div>
        <label className="cursor-pointer bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm inline-flex items-center gap-2">
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {isUploading ? "Uploading..." : currentLogo ? "Change Logo" : "Upload Logo"}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
        <p className="text-xs text-zinc-500 mt-2">Recommended: 1:1 square image.</p>
      </div>
    </div>
  );
}
