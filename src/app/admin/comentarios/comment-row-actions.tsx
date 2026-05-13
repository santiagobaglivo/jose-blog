"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Trash2, Loader2 } from "lucide-react";

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
import { moderateComment } from "./actions";

type Status = "aprobado" | "pendiente" | "rechazado";

export function CommentRowActions({
  commentId,
  status,
}: {
  commentId: string;
  status: Status;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const run = (action: "approve" | "reject" | "delete", successMsg: string) => {
    startTransition(async () => {
      const result = await moderateComment({ commentId, action });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(successMsg);
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {status !== "aprobado" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run("approve", "Comentario aprobado")}
          className="h-8 w-8 flex items-center justify-center rounded-md text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          title="Aprobar"
          aria-label="Aprobar comentario"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
      {status !== "rechazado" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run("reject", "Comentario rechazado")}
          className="h-8 w-8 flex items-center justify-center rounded-md text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50"
          title="Rechazar"
          aria-label="Rechazar comentario"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => setConfirmOpen(true)}
        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Eliminar"
        aria-label="Eliminar comentario"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar comentario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmás eliminar este comentario? El usuario no será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={
                <Button variant="outline" size="sm" disabled={isPending}>
                  Cancelar
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => run("delete", "Comentario eliminado")}
            >
              {isPending ? (
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
