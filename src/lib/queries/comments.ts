import { comments, type Comment } from "@/lib/mock-data";

export async function getApprovedCommentsByPost(slug: string): Promise<Comment[]> {
  return comments.filter((c) => c.postSlug === slug && c.status === "aprobado");
}

export async function getAllCommentsAdmin(): Promise<Comment[]> {
  return comments;
}
