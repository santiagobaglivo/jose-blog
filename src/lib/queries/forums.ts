import {
  forumCategories,
  threads,
  replies,
  type ForumCategory,
  type Thread,
  type Reply,
} from "@/lib/mock-data";

export async function getForumCategories(): Promise<ForumCategory[]> {
  return forumCategories;
}

export async function getForumCategoryBySlug(slug: string): Promise<ForumCategory | null> {
  return forumCategories.find((c) => c.slug === slug) ?? null;
}

export async function getThreadsByCategory(slug: string): Promise<Thread[]> {
  return threads.filter((t) => t.category === slug);
}

export async function getRecentThreads(limit = 4): Promise<Thread[]> {
  return threads.slice(0, limit);
}

export async function getAllThreadsAdmin(): Promise<Thread[]> {
  return threads;
}

export async function getThreadBySlug(category: string, slug: string): Promise<Thread | null> {
  return threads.find((t) => t.category === category && t.slug === slug) ?? null;
}

export async function getRepliesByThread(threadId: string): Promise<Reply[]> {
  void threadId;
  return replies;
}
