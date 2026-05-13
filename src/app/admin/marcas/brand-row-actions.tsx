"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";

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
import { deleteBrand, toggleBrandActive } from "./actions";

interface BrandRowActionsProps {
  brandId: string;
  brandName: string;
  isActive: boolean;
}

export function BrandRowActions({ brandId, brandName, isActive }: BrandRowActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isTogglePending, startToggleTransition] = useTransition();

  const handleToggle = () => {
    startToggleTransition(async () => {
      const result = await toggleBrandActive(brandId, !isActive);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isActive ? "Marca ocultada" : "Marca publicada");
      router.refresh();
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteBrand(brandId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Marca eliminada");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isTogglePending}
        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
        title={isActive ? "Ocultar" : "Publicar"}
        aria-label={isActive ? `Ocultar ${brandName}` : `Publicar ${brandName}`}
      >
        {isTogglePending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isActive ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors"
        title="Eliminar"
        aria-label={`Eliminar ${brandName}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar marca</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmás eliminar &ldquo;{brandName}&rdquo;? La marca y todos sus servicios dejarán de
              aparecer en el sitio público. La acción puede revertirse desde la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={
                <Button variant="outline" size="sm" disabled={isDeletePending}>
                  Cancelar
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeletePending}
              onClick={handleDelete}
            >
              {isDeletePending ? (
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
    </>
  );
}
