"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import type { AdminBrandMediaRow, BrandMediaKind } from "@/lib/queries/brand-media";
import { addBrandEmbed, deleteBrandMedia, uploadBrandMedia } from "./actions";

type MediaGalleryProps = {
  initialMedia: AdminBrandMediaRow[];
  brandId: string | null;
  showsMultipleBrands: boolean;
};

type DialogMode = "image" | "video" | "embed" | null;

const KIND_META: Record<
  BrandMediaKind,
  { label: string; className: string; Icon: typeof ImageIcon }
> = {
  image: {
    label: "Imagen",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    Icon: ImageIcon,
  },
  video: {
    label: "Video",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    Icon: Film,
  },
  document: {
    label: "PDF",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: FileText,
  },
  embed: {
    label: "Embed",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    Icon: Film,
  },
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function MediaGallery({
  initialMedia,
  brandId,
  showsMultipleBrands,
}: MediaGalleryProps) {
  const router = useRouter();
  const [items, setItems] = useState<AdminBrandMediaRow[]>(initialMedia);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminBrandMediaRow | null>(null);

  // Estado de subida de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Estado de embed URL
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");
  const [isAddingEmbed, setIsAddingEmbed] = useState(false);

  const [isDeleting, startDeleteTransition] = useTransition();

  const resetUploadDialog = () => {
    setUploadTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetEmbedDialog = () => {
    setEmbedUrl("");
    setEmbedTitle("");
  };

  const closeDialog = () => {
    setDialogMode(null);
    resetUploadDialog();
    resetEmbedDialog();
  };

  const onCopyUrl = async (item: AdminBrandMediaRow) => {
    const text = item.kind === "embed" && item.embed_html ? item.embed_html : item.url;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(item.kind === "embed" ? "HTML copiado" : "URL copiada");
    } catch {
      toast.error("No pudimos copiar al portapapeles");
    }
  };

  const onUpload = async (kind: "image" | "video" | "document") => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Elegí un archivo primero");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      if (brandId) formData.set("brandId", brandId);
      formData.set("kind", kind);
      formData.set("title", uploadTitle.trim());
      formData.set("file", file);

      const result = await uploadBrandMedia(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Archivo subido");
      closeDialog();
      router.refresh();
      // Optimistic add (mientras se refresca el server component).
      setItems((prev) => [
        {
          id: result.id,
          brand_id: brandId ?? "",
          brand: { id: brandId ?? "", name: "—", slug: "" },
          kind,
          url: result.url,
          thumbnail_url: result.thumbnail_url,
          title: uploadTitle.trim() || file.name,
          description: null,
          mime_type: file.type || null,
          size_bytes: file.size,
          duration_seconds: null,
          embed_provider: null,
          embed_html: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const onAddEmbed = async () => {
    if (!embedUrl.trim()) {
      toast.error("Pegá una URL de YouTube o Vimeo");
      return;
    }
    setIsAddingEmbed(true);
    try {
      const formData = new FormData();
      if (brandId) formData.set("brandId", brandId);
      formData.set("url", embedUrl.trim());
      if (embedTitle.trim()) formData.set("title", embedTitle.trim());

      const result = await addBrandEmbed(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Video agregado");
      closeDialog();
      router.refresh();
    } finally {
      setIsAddingEmbed(false);
    }
  };

  const onConfirmDelete = () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    startDeleteTransition(async () => {
      const result = await deleteBrandMedia(target.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Eliminado");
      setItems((prev) => prev.filter((m) => m.id !== target.id));
      setConfirmDelete(null);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setDialogMode("image")}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Subir imagen
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setDialogMode("video")}
        >
          <Film className="h-3.5 w-3.5" />
          Subir video
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setDialogMode("embed")}
        >
          <Video className="h-3.5 w-3.5" />
          Agregar YouTube/Vimeo
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl">
          <EmptyState
            icon={<ImageIcon className="h-6 w-6" />}
            title="Aún no hay archivos en la galería"
            description="Subí imágenes, videos o agregá un link de YouTube/Vimeo desde los botones de arriba."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const meta = KIND_META[item.kind];
            const Icon = meta.Icon;
            return (
              <div
                key={item.id}
                className="group bg-card border border-border/50 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="relative aspect-video bg-secondary/30 flex items-center justify-center overflow-hidden">
                  {item.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail_url}
                      alt={item.title ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : item.kind === "video" ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground/40" />
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className={`text-[0.6875rem] ${meta.className}`}>
                      <Icon className="h-3 w-3 mr-1" />
                      {meta.label}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <h3 className="text-[0.8125rem] font-medium text-foreground line-clamp-1">
                    {item.title ?? "(sin título)"}
                  </h3>
                  {showsMultipleBrands && (
                    <p className="text-[0.6875rem] text-muted-foreground/70 line-clamp-1">
                      {item.brand.name}
                    </p>
                  )}
                  <p className="text-[0.6875rem] text-muted-foreground/60 mt-auto">
                    {item.kind === "embed"
                      ? item.embed_provider ?? "embed"
                      : formatBytes(item.size_bytes)}
                  </p>
                </div>
                <div className="border-t border-border/50 p-2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={() => onCopyUrl(item)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {item.kind === "embed" ? "Copiar HTML" : "Copiar URL"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(item)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors"
                    title="Eliminar"
                    aria-label={`Eliminar ${item.title ?? "elemento"}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog: subir imagen o video */}
      <Dialog
        open={dialogMode === "image" || dialogMode === "video"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "image" ? "Subir imagen" : "Subir video"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "image"
                ? "Formatos: PNG, JPG, WEBP, GIF, SVG. Máx 256MB."
                : "Formatos: MP4, WEBM, MOV, OGG. Máx 256MB."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="media-title">Título (opcional)</Label>
              <Input
                id="media-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Nombre descriptivo"
                disabled={isUploading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="media-file">Archivo</Label>
              <Input
                ref={fileInputRef}
                id="media-file"
                type="file"
                accept={
                  dialogMode === "image"
                    ? "image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    : "video/mp4,video/webm,video/quicktime,video/ogg"
                }
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeDialog}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                onUpload(dialogMode === "image" ? "image" : "video")
              }
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Subiendo…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Subir
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: agregar embed */}
      <Dialog
        open={dialogMode === "embed"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar video de YouTube o Vimeo</DialogTitle>
            <DialogDescription>
              Pegá la URL completa del video. Soportamos YouTube y Vimeo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="embed-url">URL del video</Label>
              <Input
                id="embed-url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isAddingEmbed}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="embed-title">Título (opcional)</Label>
              <Input
                id="embed-title"
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value)}
                placeholder="Nombre descriptivo"
                disabled={isAddingEmbed}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeDialog}
              disabled={isAddingEmbed}
            >
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={onAddEmbed} disabled={isAddingEmbed}>
              {isAddingEmbed ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Agregando…
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: confirm delete */}
      <AlertDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar archivo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmás eliminar &ldquo;{confirmDelete?.title ?? "este elemento"}&rdquo;? Si ya
              está usado en algún post o página, los enlaces dejarán de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={
                <Button variant="outline" size="sm" disabled={isDeleting}>
                  Cancelar
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={onConfirmDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Eliminando…
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
