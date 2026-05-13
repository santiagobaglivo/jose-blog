"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const commentSchema = z.object({
  brandSlug: z.string().min(1),
  postSlug: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(2, "El comentario es muy corto")
    .max(2000, "Máximo 2000 caracteres"),
});

export type CommentInput = z.infer<typeof commentSchema>;
export type CommentResult = { ok: true } | { ok: false; error: string };

const UNAUTHENTICATED = "Iniciá sesión para comentar.";
const POST_NOT_FOUND = "No encontramos el artículo. Probá recargar la página.";
const GENERIC = "No pudimos publicar tu comentario. Probá nuevamente.";

export async function createComment(input: CommentInput): Promise<CommentResult> {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTHENTICATED };

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("slug", parsed.data.brandSlug)
    .maybeSingle();
  if (!brand) return { ok: false, error: POST_NOT_FOUND };

  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("brand_id", brand.id)
    .eq("slug", parsed.data.postSlug)
    .is("deleted_at", null)
    .maybeSingle();
  if (!post) return { ok: false, error: POST_NOT_FOUND };

  const { error } = await supabase.from("comments").insert({
    post_id: post.id,
    brand_id: brand.id,
    author_id: user.id,
    content: parsed.data.content,
    // status default 'pending' — admin lo aprueba.
  });

  if (error) return { ok: false, error: GENERIC };

  revalidatePath(`/${parsed.data.brandSlug}/blog/${parsed.data.postSlug}`);
  return { ok: true };
}
