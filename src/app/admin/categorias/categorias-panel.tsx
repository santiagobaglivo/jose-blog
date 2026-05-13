"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag as TagIcon, FolderOpen, X, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  createTagInCategorias,
  deleteCategory,
  deleteTag,
  upsertCategory,
} from "./actions";

type Category = { id: string; slug: string; name: string; description: string; count: number };
type Tag = { id: string; slug: string; name: string };

export function CategoriasPanel({
  initialCategories,
  initialTags,
}: {
  initialCategories: Category[];
  initialTags: Tag[];
}) {
  const router = useRouter();
  const [cats, setCats] = useState(initialCategories);
  const [tags, setTags] = useState(initialTags);

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    router.refresh();
  };

  const handleCreateCat = () => {
    const name = newCatName.trim();
    if (name.length < 2) {
      toast.error("Nombre muy corto");
      return;
    }
    startTransition(async () => {
      const result = await upsertCategory({ name, description: newCatDesc.trim() });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoría creada");
      setNewCatName("");
      setNewCatDesc("");
      refresh();
    });
  };

  const handleUpdateCat = () => {
    if (!editingCat) return;
    const name = editingCat.name.trim();
    if (name.length < 2) {
      toast.error("Nombre muy corto");
      return;
    }
    startTransition(async () => {
      const result = await upsertCategory({
        categoryId: editingCat.id,
        name,
        description: editingCat.description,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoría actualizada");
      setCats((prev) =>
        prev.map((c) => (c.id === editingCat.id ? { ...c, name, description: editingCat.description } : c))
      );
      setEditingCat(null);
      refresh();
    });
  };

  const handleDeleteCat = () => {
    if (!deletingCat) return;
    startTransition(async () => {
      const result = await deleteCategory({ categoryId: deletingCat.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoría eliminada");
      setCats((prev) => prev.filter((c) => c.id !== deletingCat.id));
      setDeletingCat(null);
      refresh();
    });
  };

  const handleCreateTag = () => {
    const name = newTagName.trim();
    if (name.length < 2) {
      toast.error("Nombre muy corto");
      return;
    }
    startTransition(async () => {
      const result = await createTagInCategorias({ name });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Etiqueta creada");
      setTags((prev) => [...prev, { id: result.id, name: result.name, slug: result.slug }]);
      setNewTagName("");
      refresh();
    });
  };

  const handleDeleteTag = (tag: Tag) => {
    startTransition(async () => {
      const result = await deleteTag({ tagId: tag.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Etiqueta eliminada");
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
      refresh();
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground font-sans flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Categorías ({cats.length})
            </h2>
          </div>
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/50">
            {cats.length === 0 ? (
              <div className="px-5 py-8 text-center text-[0.8125rem] text-muted-foreground/60">
                No hay categorías todavía.
              </div>
            ) : (
              cats.map((cat) => (
                <div key={cat.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[0.875rem] font-medium text-foreground">{cat.name}</h3>
                    <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[0.6875rem] shrink-0">
                    {cat.count} artículos
                  </Badge>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setEditingCat(cat)}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeletingCat(cat)}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create form */}
          <div className="mt-4 bg-card border border-dashed border-border rounded-xl p-5">
            <h3 className="text-[0.8125rem] font-medium text-foreground mb-3">Agregar categoría</h3>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              disabled={isPending}
              placeholder="Nombre de la categoría"
              className="w-full h-9 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all mb-2 disabled:opacity-60"
            />
            <input
              type="text"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              disabled={isPending}
              placeholder="Descripción breve"
              className="w-full h-9 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all mb-3 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleCreateCat}
              disabled={isPending}
              className="h-8 px-3 inline-flex items-center gap-2 text-[0.75rem] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Crear categoría
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground font-sans flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-muted-foreground" />
              Etiquetas ({tags.length})
            </h2>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-[0.75rem] text-muted-foreground/60">No hay etiquetas.</p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group flex items-center gap-1.5 h-8 pl-3 pr-1.5 border border-border/50 rounded-lg text-[0.8125rem] text-foreground hover:border-border transition-colors"
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteTag(tag)}
                      className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                      title={`Eliminar ${tag.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 bg-card border border-dashed border-border rounded-xl p-5">
            <h3 className="text-[0.8125rem] font-medium text-foreground mb-3">Agregar etiqueta</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                disabled={isPending}
                placeholder="Nombre de la etiqueta"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
                className="flex-1 h-9 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={isPending}
                className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-[0.8125rem] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Crear"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <AlertDialog open={!!editingCat} onOpenChange={(o) => !o && setEditingCat(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar categoría</AlertDialogTitle>
            <AlertDialogDescription>
              Modificá el nombre o la descripción. El slug se regenera automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {editingCat && (
            <div className="space-y-3">
              <input
                type="text"
                value={editingCat.name}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                disabled={isPending}
                className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
              />
              <input
                type="text"
                value={editingCat.description}
                onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                disabled={isPending}
                placeholder="Descripción breve"
                className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              render={<Button variant="outline" size="sm" disabled={isPending}>Cancelar</Button>}
            />
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={handleUpdateCat}
            >
              {isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deletingCat} onOpenChange={(o) => !o && setDeletingCat(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmás eliminar &ldquo;{deletingCat?.name}&rdquo;? Esta acción no se puede deshacer.
              Si hay artículos asignados, se va a rechazar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={<Button variant="outline" size="sm" disabled={isPending}>Cancelar</Button>}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleDeleteCat}
            >
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
