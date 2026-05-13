"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  EyeOff,
  MessageSquare,
  Loader2,
} from "lucide-react";

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
import { SearchBar } from "@/components/shared/search-bar";
import {
  deleteForumCategory,
  moderateThread,
  upsertForumCategory,
} from "./actions";

type ForumCat = {
  slug: string;
  id?: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  replyCount: number;
};

type Thread = {
  slug: string;
  title: string;
  author: string;
  category: string;
  date: string;
  replyCount: number;
  pinned?: boolean;
  id?: string;
};

export function ForosPanel({
  initialCategories,
  threads,
}: {
  initialCategories: ForumCat[];
  threads: Thread[];
}) {
  const router = useRouter();
  const [cats, setCats] = useState(initialCategories);
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [editing, setEditing] = useState<ForumCat | null>(null);
  const [deleting, setDeleting] = useState<ForumCat | null>(null);
  const [confirmThread, setConfirmThread] = useState<Thread | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("");
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setName("");
    setDesc("");
    setIcon("");
  };

  const handleCreate = () => {
    if (name.trim().length < 2) {
      toast.error("Nombre muy corto");
      return;
    }
    startTransition(async () => {
      const result = await upsertForumCategory({
        name: name.trim(),
        description: desc.trim(),
        icon: icon.trim(),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoría creada");
      setCreatingOpen(false);
      reset();
      router.refresh();
    });
  };

  const handleUpdate = () => {
    if (!editing || !editing.id) return;
    if (editing.name.trim().length < 2) {
      toast.error("Nombre muy corto");
      return;
    }
    startTransition(async () => {
      const result = await upsertForumCategory({
        categoryId: editing.id,
        name: editing.name,
        description: editing.description,
        icon: editing.icon,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoría actualizada");
      setCats((prev) =>
        prev.map((c) => (c.slug === editing.slug ? { ...c, ...editing } : c))
      );
      setEditing(null);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleting || !deleting.id) return;
    startTransition(async () => {
      const result = await deleteForumCategory({ categoryId: deleting.id! });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Categoría eliminada");
      setCats((prev) => prev.filter((c) => c.slug !== deleting.slug));
      setDeleting(null);
      router.refresh();
    });
  };

  const handleModerateThread = (
    threadId: string,
    action: "pin" | "unpin" | "hide" | "delete",
    successMsg: string
  ) => {
    startTransition(async () => {
      const result = await moderateThread({ threadId, action });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(successMsg);
      setConfirmThread(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Gestión de Foros
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Administrar categorías, hilos y respuestas del foro comunitario
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreatingOpen(true)}
          className="inline-flex h-10 px-4 items-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </div>

      {/* Categorías */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-foreground font-sans mb-4">
          Categorías del foro
        </h2>
        <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/50">
          {cats.length === 0 ? (
            <div className="px-5 py-8 text-center text-[0.8125rem] text-muted-foreground/60">
              No hay categorías de foro todavía.
            </div>
          ) : (
            cats.map((cat) => (
              <div key={cat.slug} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[0.875rem] font-medium text-foreground">{cat.name}</h3>
                  <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60">
                    {cat.description}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[0.75rem] text-muted-foreground/60 shrink-0">
                  <span>{cat.threadCount} hilos</span>
                  <span>{cat.replyCount} respuestas</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setEditing(cat)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setDeleting(cat)}
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
      </div>

      {/* Hilos recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground font-sans">Hilos recientes</h2>
          <SearchBar placeholder="Buscar hilos..." className="w-64" />
        </div>
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                  Hilo
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Categoría
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Respuestas
                </th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {threads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[0.8125rem] text-muted-foreground/60">
                    Sin hilos para mostrar.
                  </td>
                </tr>
              ) : (
                threads.map((thread) => (
                  <tr key={thread.slug} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {thread.pinned && <Pin className="h-3.5 w-3.5 text-warm shrink-0" />}
                        <h3 className="text-[0.8125rem] font-medium text-foreground line-clamp-1">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60">
                        por {thread.author} · {thread.date}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge variant="secondary" className="text-[0.6875rem]">
                        {thread.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground/60 hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {thread.replyCount}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      {thread.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              handleModerateThread(
                                thread.id!,
                                thread.pinned ? "unpin" : "pin",
                                thread.pinned ? "Hilo desfijado" : "Hilo fijado"
                              )
                            }
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
                            title={thread.pinned ? "Desfijar" : "Fijar"}
                          >
                            {thread.pinned ? (
                              <PinOff className="h-3.5 w-3.5" />
                            ) : (
                              <Pin className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              handleModerateThread(thread.id!, "hide", "Hilo ocultado")
                            }
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
                            title="Ocultar"
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setConfirmThread(thread)}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create dialog */}
      <AlertDialog open={creatingOpen} onOpenChange={setCreatingOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nueva categoría de foro</AlertDialogTitle>
            <AlertDialogDescription>
              Crear un espacio nuevo para que la comunidad consulte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              disabled={isPending}
              className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
            />
            <input
              type="text"
              placeholder="Icono lucide (ej: receipt, users, building, calculator, help-circle)"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={isPending}
              className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={<Button variant="outline" size="sm" disabled={isPending}>Cancelar</Button>}
            />
            <Button size="sm" disabled={isPending} onClick={handleCreate}>
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creando…
                </>
              ) : (
                "Crear"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <AlertDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar categoría</AlertDialogTitle>
          </AlertDialogHeader>
          {editing && (
            <div className="space-y-3">
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                disabled={isPending}
                className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground"
              />
              <input
                type="text"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                disabled={isPending}
                className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground"
              />
              <input
                type="text"
                value={editing.icon}
                onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                disabled={isPending}
                placeholder="Icono lucide"
                className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              render={<Button variant="outline" size="sm" disabled={isPending}>Cancelar</Button>}
            />
            <Button size="sm" disabled={isPending} onClick={handleUpdate}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete category dialog */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmás eliminar &ldquo;{deleting?.name}&rdquo;? Se eliminan también todos los
              hilos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={<Button variant="outline" size="sm" disabled={isPending}>Cancelar</Button>}
            />
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete thread */}
      <AlertDialog open={!!confirmThread} onOpenChange={(o) => !o && setConfirmThread(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar hilo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmás eliminar &ldquo;{confirmThread?.title}&rdquo;? El hilo y sus respuestas se
              marcan como eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={<Button variant="outline" size="sm" disabled={isPending}>Cancelar</Button>}
            />
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() =>
                confirmThread?.id &&
                handleModerateThread(confirmThread.id, "delete", "Hilo eliminado")
              }
            >
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
