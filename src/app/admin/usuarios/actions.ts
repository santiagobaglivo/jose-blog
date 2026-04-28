"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const updateRoleSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
  role: z.enum(["admin", "user"], {
    message: "Rol inválido",
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateUserRoleResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos actualizar el rol. Intentá nuevamente.";
const UNAUTHENTICATED_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const FORBIDDEN_ERROR = "No tenés permisos para cambiar roles.";
const SELF_DEMOTE_ERROR = "No podés quitarte el rol de admin a vos mismo.";

export async function updateUserRole(
  input: UpdateUserRoleInput
): Promise<UpdateUserRoleResult> {
  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: UNAUTHENTICATED_ERROR };
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (callerProfile?.role !== "admin") {
    return { ok: false, error: FORBIDDEN_ERROR };
  }

  if (parsed.data.userId === user.id && parsed.data.role !== "admin") {
    return { ok: false, error: SELF_DEMOTE_ERROR };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: parsed.data.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.userId);

  if (error) {
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
