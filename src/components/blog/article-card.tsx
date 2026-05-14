import Link from "next/link";
import type { Post } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Clock, MessageSquare } from "lucide-react";

/**
 * ArticleCard editorial — sin imagen destacada por default.
 * Estilo "informe técnico legal": tipografía serif para el título,
 * meta minimalista, separador inferior con accent. Inspiración Inkas Marble.
 */
export function ArticleCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col bg-card border border-border/50 rounded-xl p-6 lg:p-7 hover:border-primary/30 hover:shadow-sm transition-all duration-300 ${
        featured ? "md:col-span-2 lg:p-9" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <Badge
          variant="outline"
          className="text-[0.6875rem] font-medium uppercase tracking-widest border-primary/20 text-primary bg-primary/5"
        >
          {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
        </Badge>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>

      <h3
        className={`font-serif font-semibold text-foreground group-hover:text-primary transition-colors leading-[1.2] tracking-tight ${
          featured ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl"
        }`}
      >
        {post.title}
      </h3>

      <p
        className={`mt-4 text-[0.875rem] leading-relaxed text-muted-foreground ${
          featured ? "line-clamp-4" : "line-clamp-3"
        }`}
      >
        {post.excerpt}
      </p>

      <div className="mt-auto pt-6 flex items-center justify-between text-[0.75rem] text-muted-foreground/70 border-t border-border/40">
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground/70">{post.author.name}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{post.date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readTime}
          </span>
          {post.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {post.commentCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
