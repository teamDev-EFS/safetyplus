// src/components/admin/ImageDropZone.tsx
import { useRef, useState } from "react";

export default function ImageDropzone({
  onFiles,
  max = 8,
  existing = [],
  onRemoveExisting,
}: {
  onFiles: (files: File[]) => void;
  max?: number;
  existing?: { url: string; id?: string }[];
  onRemoveExisting?: (id?: string) => void;
}) {
  const accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
  const inputRef = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState<File[]>([]);

  const add = (files: File[]) => {
    const list = [...local, ...files].slice(0, max);
    setLocal(list);
    onFiles(list);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => add(Array.from(e.target.files || []))}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full cursor-pointer border-2 border-dashed rounded-xl px-4 py-10 text-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        Drag & drop or{" "}
        <span className="text-emerald-600 underline">browse</span>
      </div>

      {(existing.length > 0 || local.length > 0) && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {existing.map((img, i) => (
            <div key={`e-${i}`} className="relative">
              <img
                src={img.url}
                alt=""
                className="h-28 w-full object-cover rounded-lg border"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExisting(img.id);
                  }}
                  className="absolute top-1 right-1 bg-white/90 rounded-full px-2 py-1 text-xs text-red-600 shadow"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {local.map((f, i) => (
            <div key={`l-${i}`} className="relative">
              <img
                src={URL.createObjectURL(f)}
                alt=""
                className="h-28 w-full object-cover rounded-lg border"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
