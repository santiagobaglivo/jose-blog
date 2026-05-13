import { getCategoriesAdmin, getTagsAdmin } from "@/lib/queries/categories";
import { CategoriasPanel } from "./categorias-panel";

export default async function CategoriasAdmin() {
  const [cats, tags] = await Promise.all([getCategoriesAdmin(), getTagsAdmin()]);

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

      <CategoriasPanel
        initialCategories={cats.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          count: c.count,
        }))}
        initialTags={tags.map((t) => ({ id: t.id, slug: t.slug, name: t.name }))}
      />
    </div>
  );
}
