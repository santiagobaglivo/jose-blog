// Tipos compartidos del dominio blog/foros.
// Se exportan desde acá para no acoplar consumers a la capa de queries.

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  count: number;
}

export interface Tag {
  slug: string;
  name: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML sanitizado
  image: string;
  category: string; // slug
  tags: string[]; // slugs
  author: Author;
  date: string; // formato local: "12 de abril de 2026"
  readTime: string; // "6 min de lectura"
  status: "publicado" | "borrador" | "programado";
  scheduledDate?: string;
  commentCount: number;
}

export interface Comment {
  id: string;
  author: string;
  email: string;
  avatar: string;
  content: string;
  date: string;
  status: "aprobado" | "pendiente" | "rechazado";
  postSlug: string;
}

export interface ForumCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  replyCount: number;
  lastActivity: string;
  lastAuthor: string;
}

export interface Thread {
  slug: string;
  title: string;
  author: string;
  authorAvatar: string;
  category: string; // slug
  date: string;
  replyCount: number;
  viewCount: number;
  lastReplyDate: string;
  lastReplyAuthor: string;
  pinned?: boolean;
  content: string;
}

export interface Reply {
  id: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
  isAuthor?: boolean;
}
