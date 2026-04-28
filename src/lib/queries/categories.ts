import { blogCategories, tags, type Category, type Tag } from "@/lib/mock-data";

export async function getCategories(): Promise<Category[]> {
  return blogCategories;
}

export async function getTags(): Promise<Tag[]> {
  return tags;
}
