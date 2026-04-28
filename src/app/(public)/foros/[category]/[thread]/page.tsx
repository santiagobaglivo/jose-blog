import Link from "next/link";
import {
  getForumCategories,
  getForumCategoryBySlug,
  getThreadBySlug,
  getRecentThreads,
  getRepliesByThread,
} from "@/lib/queries/forums";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, ArrowLeft, Pin, ThumbsUp, Flag } from "lucide-react";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ category: string; thread: string }>;
}) {
  const { category, thread: threadSlug } = await params;
  const cat = (await getForumCategoryBySlug(category)) ?? (await getForumCategories())[0];
  const threadData =
    (await getThreadBySlug(category, threadSlug)) ?? (await getRecentThreads(1))[0];
  const replies = await getRepliesByThread(threadData.slug);

  return (
    <>
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Foros", href: "/foros" },
              { label: cat.name, href: `/foros/${category}` },
              { label: threadData.title },
            ]}
          />
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Link
            href={`/foros/${category}`}
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a {cat.name}
          </Link>

          {/* Thread header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-[0.75rem]">
                {cat.name}
              </Badge>
              {threadData.pinned && (
                <Badge variant="secondary" className="text-[0.6875rem] gap-1">
                  <Pin className="h-3 w-3" />
                  Fijado
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              {threadData.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.8125rem] text-muted-foreground">
              <span>{threadData.author}</span>
              <span>{threadData.date}</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {threadData.viewCount} vistas
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {threadData.replyCount} respuestas
              </span>
            </div>
          </div>

          {/* Original post */}
          <div className="bg-card border border-border/50 rounded-xl p-6 mb-4">
            <div className="flex gap-4">
              <div className="shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[0.75rem] font-semibold">
                  {threadData.authorAvatar}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[0.875rem] font-medium text-foreground">
                    {threadData.author}
                  </span>
                  <Badge variant="secondary" className="text-[0.6875rem]">
                    Autor
                  </Badge>
                </div>
                <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60">{threadData.date}</p>
                <div className="mt-4 text-[0.875rem] text-muted-foreground leading-relaxed">
                  {threadData.content}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground/60 hover:text-foreground transition-colors">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Útil
                  </button>
                  <button className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground/60 hover:text-foreground transition-colors">
                    <Flag className="h-3.5 w-3.5" />
                    Reportar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-3">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className={`bg-card border rounded-xl p-6 ${
                  reply.isAuthor ? "border-warm/30 bg-warm/[0.02]" : "border-border/50"
                }`}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-[0.75rem] font-semibold text-muted-foreground">
                      {reply.avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.875rem] font-medium text-foreground">
                        {reply.author}
                      </span>
                      {reply.isAuthor && (
                        <Badge variant="secondary" className="text-[0.6875rem]">
                          Autor
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60">{reply.date}</p>
                    <div className="mt-3 text-[0.875rem] text-muted-foreground leading-relaxed">
                      {reply.content}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <button className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground/60 hover:text-foreground transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Útil
                      </button>
                      <button className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground/60 hover:text-foreground transition-colors">
                        <Flag className="h-3.5 w-3.5" />
                        Reportar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply form */}
          <div className="mt-8 bg-card border border-border/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground font-sans mb-4">
              Responder a este hilo
            </h3>
            <textarea
              rows={4}
              placeholder="Escriba su respuesta..."
              className="w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[0.75rem] text-muted-foreground/60">
                Las respuestas son moderadas antes de publicarse.
              </p>
              <button className="h-9 px-5 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors">
                Publicar respuesta
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
