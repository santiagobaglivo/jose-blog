"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ============================================================================
// Crear respuesta a un hilo
// ============================================================================

const replySchema = z.object({
  brandSlug: z.string().min(1),
  threadSlug: z.string().min(1),
  categorySlug: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(2, "La respuesta es muy corta")
    .max(10000, "Máximo 10000 caracteres"),
});

export type ReplyInput = z.infer<typeof replySchema>;
export type ReplyResult = { ok: true } | { ok: false; error: string };

const UNAUTHENTICATED = "Iniciá sesión para participar en el foro.";
const NOT_FOUND = "No encontramos el hilo. Probá recargar la página.";
const GENERIC = "No pudimos publicar tu respuesta. Probá nuevamente.";

export async function createForumReply(input: ReplyInput): Promise<ReplyResult> {
  const parsed = replySchema.safeParse(input);
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
  if (!brand) return { ok: false, error: NOT_FOUND };

  const { data: thread } = await supabase
    .from("forum_threads")
    .select("id, reply_count")
    .eq("brand_id", brand.id)
    .eq("slug", parsed.data.threadSlug)
    .is("deleted_at", null)
    .maybeSingle();
  if (!thread) return { ok: false, error: NOT_FOUND };

  const { error: insertError } = await supabase.from("forum_replies").insert({
    thread_id: thread.id,
    author_id: user.id,
    content: parsed.data.content,
  });
  if (insertError) return { ok: false, error: GENERIC };

  // Actualizar contador y última actividad del hilo (usar admin client para bypass RLS update).
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  await admin
    .from("forum_threads")
    .update({
      reply_count: (thread.reply_count ?? 0) + 1,
      last_reply_at: new Date().toISOString(),
      last_reply_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", thread.id);

  revalidatePath(
    `/${parsed.data.brandSlug}/foros/${parsed.data.categorySlug}/${parsed.data.threadSlug}`
  );
  return { ok: true };
}

// ============================================================================
// Crear hilo nuevo
// ============================================================================

const newThreadSchema = z.object({
  brandSlug: z.string().min(1),
  categorySlug: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(5, "El título es muy corto")
    .max(200, "Máximo 200 caracteres"),
  content: z
    .string()
    .trim()
    .min(10, "Contanos un poco más sobre tu consulta")
    .max(10000, "Máximo 10000 caracteres"),
});

export type NewThreadInput = z.infer<typeof newThreadSchema>;
export type NewThreadResult =
  | { ok: true; threadSlug: string; categorySlug: string }
  | { ok: false; error: string };

export async function createForumThread(input: NewThreadInput): Promise<NewThreadResult> {
  const parsed = newThreadSchema.safeParse(input);
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
  if (!brand) return { ok: false, error: NOT_FOUND };

  const { data: category } = await supabase
    .from("forum_categories")
    .select("id")
    .eq("brand_id", brand.id)
    .eq("slug", parsed.data.categorySlug)
    .maybeSingle();
  if (!category) return { ok: false, error: NOT_FOUND };

  // Slug único: si colisiona, append `-2`, `-3`...
  const base = slugify(parsed.data.title) || `hilo-${Date.now()}`;
  let candidate = base;
  let suffix = 1;
  while (true) {
    const { data: existing } = await supabase
      .from("forum_threads")
      .select("id")
      .eq("brand_id", brand.id)
      .eq("slug", candidate)
      .maybeSingle();
    if (!existing) break;
    suffix += 1;
    candidate = `${base}-${suffix}`;
    if (suffix > 50) return { ok: false, error: GENERIC };
  }

  const { error } = await supabase.from("forum_threads").insert({
    brand_id: brand.id,
    category_id: category.id,
    author_id: user.id,
    slug: candidate,
    title: parsed.data.title,
    content: parsed.data.content,
  });
  if (error) return { ok: false, error: GENERIC };

  revalidatePath(`/${parsed.data.brandSlug}/foros`);
  revalidatePath(`/${parsed.data.brandSlug}/foros/${parsed.data.categorySlug}`);
  return {
    ok: true,
    threadSlug: candidate,
    categorySlug: parsed.data.categorySlug,
  };
}
