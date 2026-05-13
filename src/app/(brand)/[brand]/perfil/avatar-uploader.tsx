"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Loader2, Upload } from "lucide-react";

import { uploadAvatar } from "./actions";

const ACCEPT_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_MB = 2;

export function AvatarUploader({ currentUrl }: { currentUrl?: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [isPending, startTransition] = useTransition();

  const handleFile = (file: File) => {
    if (!ACCEPT_MIME.includes(file.type)) {
      toast.error("Formato no soportado. Usá PNG, JPG o WEBP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`La imagen supera ${MAX_MB} MB.`);
      return;
    }

    const previousUrl = preview;
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadAvatar(formData);
      URL.revokeObjectURL(blobUrl);
      if (!result.ok) {
        toast.error(result.error);
        setPreview(previousUrl);
        return;
      }
      toast.success("Foto actualizada");
      setPreview(result.url);
      router.refresh();
    });
  };

  const openPicker = () => {
    if (isPending) return;
    inputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border/50 bg-secondary/40">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Foto de perfil"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/50">
            <ImageIcon className="h-7 w-7" aria-hidden />
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MIME.join(",")}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
          disabled={isPending}
        />
        <button
          type="button"
          onClick={openPicker}
          disabled={isPending}
          className="inline-flex items-center gap-2 h-9 px-3 text-[0.8125rem] font-medium border border-border rounded-md hover:bg-secondary/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-fit"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {preview ? "Cambiar foto" : "Subir foto"}
        </button>
        <p className="text-[0.75rem] text-muted-foreground">
          PNG, JPG o WEBP · máx {MAX_MB} MB.
        </p>
      </div>
    </div>
  );
}
