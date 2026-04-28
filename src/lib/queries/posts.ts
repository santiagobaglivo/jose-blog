import { posts, dashboardStats, type Post } from "@/lib/mock-data";

export async function getPublishedPosts(): Promise<Post[]> {
  return posts.filter((p) => p.status === "publicado");
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedPosts(slug: string, limit = 4): Promise<Post[]> {
  return posts.filter((p) => p.status === "publicado" && p.slug !== slug).slice(0, limit);
}

export async function getDraftPosts(): Promise<Post[]> {
  return posts.filter((p) => p.status === "borrador");
}

export async function getScheduledPosts(): Promise<Post[]> {
  return posts.filter((p) => p.status === "programado");
}

export async function getAllPostsAdmin(): Promise<Post[]> {
  return posts;
}

export async function getDashboardStats(): Promise<typeof dashboardStats> {
  return dashboardStats;
}
