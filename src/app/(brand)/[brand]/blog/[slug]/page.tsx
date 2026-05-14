import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/lib/queries/brands";
import { getPostBySlug, getRelatedPosts } from "@/lib/queries/posts";
import { getApprovedCommentsByPost } from "@/lib/queries/comments";
import { getCategories } from "@/lib/queries/categories";
import { requireBrandContext } from "@/lib/auth/brand-context";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/search-bar";
import { Clock, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { QuickContact } from "@/components/shared/quick-contact";
import { CommentForm } from "./comment-form";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await requireBrandContext();
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const [postComments, recent, blogCategories, brandDetail] = await Promise.all([
    getApprovedCommentsByPost(post.slug),
    getRelatedPosts(post.slug, 4),
    getCategories(),
    getBrandBySlug(brand.slug),
  ]);

  return (
    <>
      {/* Hero editorial — sin imagen */}
      <section className="border-b border-border/40 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
          <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

          <div className="mt-8 max-w-4xl">
            <Badge
              variant="outline"
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] border-primary/30 text-primary bg-primary/5 mb-5"
            >
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-foreground tracking-tight leading-[1.1]">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-[0.8125rem] text-muted-foreground border-t border-border/30 pt-5">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground text-[0.6875rem] font-semibold">
                    {post.author.avatar}
                  </span>
                </div>
                <div>
                  <span className="text-foreground font-medium block leading-tight">
                    {post.author.name}
                  </span>
                  <span className="text-[0.6875rem] text-muted-foreground/70">
                    {post.author.role}
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-border/50 hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
              <span>{post.date}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Article */}
            <article className="flex-1 min-w-0 max-w-3xl">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al blog
              </Link>

              {/* Content */}
              <div
                className="prose-premium max-w-none [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-[1rem] [&_p]:leading-[1.75] [&_p]:text-foreground/85 [&_p]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6 [&_ul]:my-4 [&_ul]:pl-5 [&_li]:my-2 [&_li]:leading-[1.7]"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Quick contact / asesoría directa */}
              {brandDetail && (
                <div className="mt-10">
                  <QuickContact
                    brand={{
                      name: brandDetail.name,
                      whatsapp_number: brandDetail.whatsapp_number,
                      contact_email: brandDetail.contact_email,
                      instagram_url: brandDetail.instagram_url,
                      facebook_url: brandDetail.facebook_url,
                      tiktok_url: brandDetail.tiktok_url,
                      linkedin_url: brandDetail.linkedin_url,
                      twitter_url: brandDetail.twitter_url,
                    }}
                    context={post.title}
                  />
                </div>
              )}

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

                <CommentForm brandSlug={brand.slug} postSlug={post.slug} />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-8">
              <SearchBar placeholder="Buscar artículos..." />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">Categorías</h3>
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
