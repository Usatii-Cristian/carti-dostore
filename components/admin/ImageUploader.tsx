"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

export function ImageUploader({
  label,
  value,
  onChange,
  multiple = false,
}: {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Încărcarea a eșuat.");
      return null;
    }

    return data.url as string;
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const files = Array.from(fileList);
      const uploaded: string[] = [];

      for (const file of files) {
        const url = await uploadFile(file);
        if (url) uploaded.push(url);
      }

      if (uploaded.length > 0) {
        onChange(multiple ? [...value, ...uploaded] : [uploaded[0]]);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-slate-700">{label}</p>

      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={url + index} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
            <Image
              src={url}
              alt={`Previzualizare imagine încărcată ${index + 1}`}
              fill
              sizes="96px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Șterge imaginea"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}

        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-500 transition-colors hover:border-navy hover:text-navy disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Upload className="h-5 w-5" aria-hidden="true" />
                <span className="text-[11px]">Încarcă</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={(event) => handleFiles(event.target.files)}
        className="hidden"
      />

      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
