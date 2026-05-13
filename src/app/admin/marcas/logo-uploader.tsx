"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Loader2, Upload } from "lucide-react";

import { uploadBrandLogo } from "./actions";

export function LogoUploader({
  brandId,
  currentUrl,
  onUploaded,
}: {
  brandId?: string;
  currentUrl?: string | null;
  /** Si el form está creando una brand nueva (sin id), no se puede subir todavía. */
  onUploaded?: (url: string) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [isPending, startTransition] = useTransition();

  const disabled = !brandId;

  const handleFile = (file: File) => {
    if (!brandId) {
      toast.error("Guardá la marca antes de subir un logo.");
      return;
    }

    // Preview local inmediato.
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);

    const formData = new FormData();
    formData.append("brandId", brandId);
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadBrandLogo(formData);
      if (!result.ok) {
        toast.error(result.error);
        setPreview(currentUrl ?? null);
        URL.revokeObjectURL(blobUrl);
        return;
      }
      toast.success("Imagen subida");
      setPreview(result.url);
      URL.revokeObjectURL(blobUrl);
      onUploaded?.(result.url);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="aspect-[16/9] rounded-lg overflow-hidden bg-secondary/40 border border-border/50 relative">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Logo / hero de la marca"
            className="w-full h-full object-contain bg-white"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
            <ImageIcon className="h-10 w-10" />
            <span className="text-[0.75rem]">Sin imagen subida</span>
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[0.8125rem] gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Subiendo…
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
          disabled={disabled || isPending}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isPending}
          className="inline-flex items-center gap-2 h-9 px-3 text-[0.8125rem] font-medium border border-border rounded-md hover:bg-secondary/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Upload className="h-3.5 w-3.5" />
          {preview ? "Reemplazar imagen" : "Subir imagen"}
        </button>
        {disabled && (
          <p className="text-[0.75rem] text-muted-foreground/60">
            Guardá la marca primero para habilitar el upload.
          </p>
        )}
      </div>
    </div>
  );
}
