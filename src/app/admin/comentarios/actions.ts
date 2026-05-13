"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const moderateSchema = z.object({
  commentId: z.string().uuid("ID inválido"),
  action: z.enum(["approve", "reject", "delete"]),
});

export type ModerateCommentInput = z.infer<typeof moderateSchema>;
export type ModerateCommentResult = { ok: true } | { ok: false; error: string };

const UNAUTH = "Tu sesión expiró. Volvé a iniciar sesión.";
const FORBIDDEN = "No tenés permisos sobre este comentario.";
const GENERIC = "No pudimos completar la acción. Probá nuevamente.";

export async function moderateComment(
  input: ModerateCommentInput
): Promise<ModerateCommentResult> {
  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTH };

  // La RLS comments_admin_all valida is_admin_of(brand_id). Solo super o admin local de la
  // brand del comment puede tocar.
  if (parsed.data.action === "delete") {
    const { error } = await supabase
      .from("comments")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.commentId)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  } else {
    const newStatus = parsed.data.action === "approve" ? "approved" : "rejected";
    const { error } = await supabase
      .from("comments")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", parsed.data.commentId);
    if (error) return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  }

  revalidatePath("/admin/comentarios");
  revalidatePath("/admin");
  return { ok: true };
}
