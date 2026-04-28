import Link from "next/link";
import { ArrowLeft, Image, Bold, Italic, List, Link2, Heading2, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategories, getTags } from "@/lib/queries/categories";

export default async function NuevoArticuloPage() {
  const [blogCategories, tags] = await Promise.all([getCategories(), getTags()]);
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articulos"
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
              Nuevo artículo
            </h1>
            <p className="mt-0.5 text-[0.875rem] text-muted-foreground">
              Crear una nueva publicación para el blog
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 border border-border text-[0.8125rem] font-medium rounded-lg hover:bg-secondary/60 transition-colors">
            Guardar borrador
          </button>
          <button className="h-9 px-4 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors">
            Publicar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <input
            type="text"
            placeholder="Título del artículo"
            className="w-full h-14 px-5 bg-card border border-border/50 rounded-xl text-xl font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-serif"
          />

          {/* Subtitle */}
          <input
            type="text"
            placeholder="Subtítulo opcional"
            className="w-full h-11 px-5 bg-card border border-border/50 rounded-xl text-[0.9375rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
          />

          {/* Featured image */}
          <div className="bg-card border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-ring/40 hover:bg-secondary/20 transition-all">
            <div className="h-12 w-12 rounded-xl bg-secondary/60 flex items-center justify-center text-muted-foreground/50 mb-3">
              <Image className="h-6 w-6" />
            </div>
            <p className="text-[0.875rem] font-medium text-foreground">Imagen destacada</p>
            <p className="text-[0.8125rem] text-muted-foreground/60 mt-1">
              Arrastrá una imagen o hacé clic para seleccionar
            </p>
          </div>

          {/* Toolbar */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 bg-secondary/20">
              {[
                { icon: Heading2, label: "Título" },
                { icon: Bold, label: "Negrita" },
                { icon: Italic, label: "Cursiva" },
                { icon: List, label: "Lista" },
                { icon: Quote, label: "Cita" },
                { icon: Link2, label: "Enlace" },
                { icon: Image, label: "Imagen" },
              ].map((tool) => (
                <button
                  key={tool.label}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  title={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <textarea
              rows={18}
              placeholder="Comience a escribir el contenido del artículo...

Utilice la barra de herramientas para dar formato al texto, agregar títulos, listas, citas y enlaces. También puede insertar imágenes en el cuerpo del artículo."
              className="w-full px-5 py-4 text-[0.9375rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-sans mb-4">
              Estado de publicación
            </h3>
            <div className="space-y-3">
              {[
                { value: "borrador", label: "Borrador", desc: "No visible al público" },
                { value: "programado", label: "Programado", desc: "Se publicará automáticamente" },
                { value: "publicado", label: "Publicado", desc: "Visible en el blog" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors has-[:checked]:border-primary/30 has-[:checked]:bg-primary/[0.03]"
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    defaultChecked={opt.value === "borrador"}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <span className="text-[0.8125rem] font-medium text-foreground">
                      {opt.label}
                    </span>
                    <p className="text-[0.75rem] text-muted-foreground/60">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Schedule date */}
            <div className="mt-4">
              <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                Fecha de publicación
              </label>
              <input
                type="date"
                className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-sans mb-4">Categoría</h3>
            <select className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all appearance-none">
              <option value="">Seleccionar categoría</option>
              {blogCategories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-sans mb-4">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.slug}
                  className="h-7 px-2.5 text-[0.75rem] font-medium border border-border/50 rounded-md text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Author */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-sans mb-4">Autor</h3>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[0.6875rem] font-semibold">MV</span>
              </div>
              <div>
                <p className="text-[0.8125rem] font-medium text-foreground">Martín Velázquez</p>
                <p className="text-[0.75rem] text-muted-foreground/60">Socio fundador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
