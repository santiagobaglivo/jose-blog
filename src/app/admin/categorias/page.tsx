import { getCategories, getTags } from "@/lib/queries/categories";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Tag, FolderOpen } from "lucide-react";

export default async function CategoriasAdmin() {
  const [blogCategories, tags] = await Promise.all([getCategories(), getTags()]);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
          Categorías & Etiquetas
        </h1>
        <p className="mt-1 text-[0.875rem] text-muted-foreground">
          Organización del contenido del blog
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground font-sans flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Categorías ({blogCategories.length})
            </h2>
            <button className="h-8 px-3 text-[0.75rem] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Nueva
            </button>
          </div>
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/50">
            {blogCategories.map((cat) => (
              <div key={cat.slug} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[0.875rem] font-medium text-foreground">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[0.6875rem] shrink-0">
                  {cat.count} artículos
                </Badge>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New category form */}
          <div className="mt-4 bg-card border border-dashed border-border rounded-xl p-5">
            <h3 className="text-[0.8125rem] font-medium text-foreground mb-3">
              Agregar categoría
            </h3>
            <input
              type="text"
              placeholder="Nombre de la categoría"
              className="w-full h-9 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all mb-2"
            />
            <input
              type="text"
              placeholder="Descripción breve"
              className="w-full h-9 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all mb-3"
            />
            <button className="h-8 px-3 text-[0.75rem] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Crear categoría
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground font-sans flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Etiquetas ({tags.length})
            </h2>
            <button className="h-8 px-3 text-[0.75rem] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Nueva
            </button>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.slug}
                  className="group flex items-center gap-1.5 h-8 pl-3 pr-1.5 border border-border/50 rounded-lg text-[0.8125rem] text-foreground hover:border-border transition-colors"
                >
                  <span>{tag.name}</span>
                  <button className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* New tag form */}
          <div className="mt-4 bg-card border border-dashed border-border rounded-xl p-5">
            <h3 className="text-[0.8125rem] font-medium text-foreground mb-3">
              Agregar etiqueta
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nombre de la etiqueta"
                className="flex-1 h-9 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
              />
              <button className="h-9 px-4 text-[0.8125rem] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shrink-0">
                Crear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
