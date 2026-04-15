import { posts, comments, blogCategories } from "@/lib/mock-data";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/search-bar";
import { PostImage } from "@/components/shared/post-image";
import { Clock, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug) ?? posts[0];
  const postComments = comments.filter(
    (c) => c.postSlug === post.slug && c.status === "aprobado"
  );
  const recent = posts.filter((p) => p.status === "publicado" && p.slug !== post.slug).slice(0, 4);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Article */}
            <article className="flex-1 min-w-0">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al blog
              </Link>

              <Badge variant="secondary" className="mb-4 text-[0.75rem]">
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </Badge>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[0.8125rem] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-[0.6875rem] font-semibold">
                      {post.author.avatar}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground font-medium">{post.author.name}</span>
                    <span className="text-muted-foreground/50 mx-1.5">·</span>
                    <span>{post.author.role}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
                <span>{post.date}</span>
              </div>

              {/* Featured image */}
              <div className="mt-8 rounded-xl overflow-hidden aspect-[2/1] bg-secondary relative">
                <PostImage
                  src={post.image}
                  alt={post.title}
                  priority
                />
              </div>

              {/* Content */}
              <div
                className="mt-10 prose-premium max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="mt-10 pt-8 border-t border-border/50 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[0.75rem] font-normal">
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Badge>
                ))}
              </div>

              {/* Comments */}
              <div className="mt-12 pt-8 border-t border-border/50">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  Comentarios ({postComments.length})
                </h2>

                <div className="mt-6 space-y-6">
                  {postComments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="shrink-0 h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                          {comment.avatar}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.8125rem] font-medium text-foreground">
                            {comment.author}
                          </span>
                          <span className="text-[0.75rem] text-muted-foreground/60">
                            {comment.date}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[0.8125rem] text-muted-foreground leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment form */}
                <div className="mt-10 p-6 rounded-xl bg-secondary/30 border border-border/50">
                  <h3 className="text-sm font-semibold text-foreground font-sans mb-4">
                    Dejar un comentario
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nombre"
                      className="h-10 px-4 bg-white border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="h-10 px-4 bg-white border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                    />
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Escriba su comentario..."
                    className="w-full px-4 py-3 bg-white border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[0.75rem] text-muted-foreground/60">
                      Los comentarios son moderados antes de su publicación.
                    </p>
                    <button className="h-9 px-5 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors">
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-8">
              <SearchBar placeholder="Buscar artículos..." />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">
                  Categorías
                </h3>
                <ul className="space-y-2">
                  {blogCategories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/blog?cat=${cat.slug}`}
                        className="flex items-center justify-between py-1.5 text-[0.8125rem] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{cat.name}</span>
                        <Badge variant="secondary" className="text-[0.6875rem] font-normal">
                          {cat.count}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">
                  Artículos recientes
                </h3>
                <ul className="space-y-4">
                  {recent.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className="group block">
                        <h4 className="text-[0.8125rem] font-medium text-foreground group-hover:text-primary/80 transition-colors leading-snug line-clamp-2">
                          {p.title}
                        </h4>
                        <p className="mt-1 text-[0.75rem] text-muted-foreground/70">{p.date}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
