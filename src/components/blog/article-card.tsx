import Link from "next/link";
import { Post } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare } from "lucide-react";
import { PostImage } from "@/components/shared/post-image";

export function ArticleCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden hover:border-border hover:shadow-md transition-all duration-300 ${
        featured ? "md:flex-row md:col-span-2" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-secondary ${
          featured ? "md:w-1/2 aspect-[16/10] md:aspect-auto md:min-h-[280px]" : "aspect-[16/10]"
        }`}
      >
        <PostImage
          src={post.image}
          alt={post.title}
          className="group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 z-10">
          <Badge
            variant="secondary"
            className="bg-white/90 backdrop-blur-sm text-foreground text-[0.6875rem] font-medium"
          >
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-col justify-between p-5 ${featured ? "md:w-1/2 md:p-8" : ""}`}>
        <div>
          <h3
            className={`font-semibold text-foreground group-hover:text-primary/80 transition-colors leading-snug ${
              featured ? "text-xl lg:text-2xl" : "text-base"
            }`}
          >
            {post.title}
          </h3>
          <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-4 text-[0.75rem] text-muted-foreground/70">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
          {post.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.commentCount}
            </span>
          )}
          <span className="ml-auto">{post.date}</span>
        </div>
      </div>
    </Link>
  );
}
