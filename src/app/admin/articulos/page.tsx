import { getAllPostsAdmin } from "@/lib/queries/posts";
import { postStatusMap } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/search-bar";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function ArticulosAdmin() {
  const posts = await getAllPostsAdmin();
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Artículos
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Gestión de publicaciones del blog
          </p>
        </div>
        <Link
          href="/admin/articulos/nuevo"
          className="inline-flex h-10 px-4 items-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo artículo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <SearchBar placeholder="Buscar artículos..." className="w-full sm:w-72" />
        <div className="flex items-center gap-2">
          {["Todos", "Publicados", "Borradores", "Programados"].map((filter) => (
            <button
              key={filter}
              className={`h-8 px-3 text-[0.75rem] font-medium rounded-md transition-colors ${
                filter === "Todos"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                  Artículo
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Categoría
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Autor
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Fecha
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {posts.map((post) => {
                const status = postStatusMap[post.status];
                return (
                  <tr key={post.slug} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4">
                      <h3 className="text-[0.8125rem] font-medium text-foreground line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60 line-clamp-1">
                        {post.excerpt}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge variant="secondary" className="text-[0.6875rem]">
                        {post.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground hidden lg:table-cell">
                      {post.author.name}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={`text-[0.6875rem] ${status.className}`}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground/60 hidden sm:table-cell">
                      {post.status === "programado" ? post.scheduledDate : post.date || "—"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                          title="Ver"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
