"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_MAX_MB = 1;

type ImageUploaderProps = {
  bucket: string;
  path: (file: File) => string;
  onUpload: (url: string) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  maxSizeMB?: number;
  accept?: string[];
  initialUrl?: string | null;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
};

function formatList(values: string[]) {
  return values.map((v) => v.split("/")[1]?.toUpperCase() ?? v).join(", ");
}

export function ImageUploader({
  bucket,
  path,
  onUpload,
  onRemove,
  maxSizeMB = DEFAULT_MAX_MB,
  accept = DEFAULT_ACCEPT,
  initialUrl = null,
  label = "Imagen",
  helperText,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validate = (file: File): string | null => {
    if (!accept.includes(file.type)) {
      return `Formato no permitido. Usá ${formatList(accept)}.`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `El archivo supera ${maxSizeMB} MB.`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const previousUrl = previewUrl;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const supabase = createClient();
      const filePath = path(file);
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        toast.error("No pudimos subir la imagen. Intentá nuevamente.");
        setPreviewUrl(previousUrl);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      setPreviewUrl(publicUrl);
      await onUpload(publicUrl);
    } catch {
      toast.error("No pudimos subir la imagen. Intentá nuevamente.");
      setPreviewUrl(previousUrl);
    } finally {
      URL.revokeObjectURL(localUrl);
      setIsUploading(false);
    }
  };

  const openPicker = () => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (disabled || isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const handleRemove = async () => {
    if (disabled || isUploading) return;
    setPreviewUrl(null);
    if (onRemove) {
      try {
        await onRemove();
      } catch {
        toast.error("No pudimos quitar la imagen.");
      }
    }
  };

  const acceptAttr = accept.join(",");
  const isInteractive = !disabled && !isUploading;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <span className="text-[0.8125rem] font-medium text-foreground">{label}</span>
      ) : null}

      <div
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-disabled={!isInteractive}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (!isInteractive) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-center gap-4 rounded-xl border border-dashed border-border/60 bg-secondary/30 px-4 py-4 text-left transition-colors",
          isInteractive && "cursor-pointer hover:border-ring/40 hover:bg-secondary/50",
          isDragging && "border-ring/60 bg-secondary/60",
          !isInteractive && "opacity-60 cursor-not-allowed"
        )}
      >
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/60">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Vista previa"
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
          )}
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-5 w-5 animate-spin text-foreground" aria-hidden />
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[0.8125rem] font-medium text-foreground inline-flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" aria-hidden />
            {previewUrl ? "Cambiar imagen" : "Subí una imagen"}
          </p>
          <p className="mt-0.5 text-[0.75rem] text-muted-foreground">
            {helperText ?? `Arrastrá o hacé clic. ${formatList(accept)} · máx ${maxSizeMB} MB.`}
          </p>
        </div>

        {previewUrl && !isUploading ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void handleRemove();
            }}
            disabled={!isInteractive}
            aria-label="Quitar imagen"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          onChange={handleChange}
          className="sr-only"
          tabIndex={-1}
          disabled={!isInteractive}
        />
      </div>
    </div>
  );
}
