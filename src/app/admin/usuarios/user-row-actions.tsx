"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, ShieldCheck, ShieldOff } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { updateUserRole } from "./actions";

type Role = "admin" | "user";

export function UserRowActions({
  userId,
  userName,
  currentRole,
  isSelf,
}: {
  userId: string;
  userName: string;
  currentRole: Role;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  const nextRole: Role = currentRole === "admin" ? "user" : "admin";
  const willDemoteSelf = isSelf && nextRole !== "admin";

  const actionLabel =
    nextRole === "admin" ? "Cambiar a admin" : "Cambiar a usuario";

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await updateUserRole({ userId, role: nextRole });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        nextRole === "admin"
          ? `${userName} ahora es admin`
          : `${userName} ya no es admin`
      );
      setDialogOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label={`Acciones para ${userName}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            disabled={willDemoteSelf}
            onClick={(event) => {
              if (willDemoteSelf) {
                event.preventDefault();
                return;
              }
              setDialogOpen(true);
            }}
          >
            {nextRole === "admin" ? (
              <ShieldCheck className="text-muted-foreground" />
            ) : (
              <ShieldOff className="text-muted-foreground" />
            )}
            {actionLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
            <AlertDialogDescription>
              {nextRole === "admin"
                ? `¿Confirmás otorgarle permisos de administrador a ${userName}? Podrá gestionar contenido y otros usuarios.`
                : `¿Confirmás quitarle los permisos de administrador a ${userName}? Pasará a tener un rol de usuario estándar.`}
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
              variant={nextRole === "admin" ? "default" : "destructive"}
              size="sm"
              disabled={isPending}
              onClick={handleConfirm}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Aplicando…
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
