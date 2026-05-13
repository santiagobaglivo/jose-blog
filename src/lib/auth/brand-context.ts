import { headers } from "next/headers";

export type BrandContext = {
  id: string;
  slug: string;
  name: string;
  accentColor: string | null;
};

/**
 * Devuelve el brand resuelto por el proxy (desde el host header).
 * Llamar desde Server Components / Server Actions / Route Handlers
 * dentro del route group (brand)/[brand]/...
 *
 * Retorna null si el request llega por un dominio sin marca asignada
 * (ej. localhost o el dominio del admin).
 */
export async function getBrandContext(): Promise<BrandContext | null> {
  const h = await headers();
  const id = h.get("x-brand-id");
  const slug = h.get("x-brand-slug");
  const name = h.get("x-brand-name");
  if (!id || !slug || !name) return null;
  return {
    id,
    slug,
    name,
    accentColor: h.get("x-brand-accent"),
  };
}

/**
 * Igual que getBrandContext pero throw si no hay brand.
 * Usar en rutas que requieren brand obligatorio (pages dentro de _brand/[brand]/...).
 */
export async function requireBrandContext(): Promise<BrandContext> {
  const brand = await getBrandContext();
  if (!brand) {
    throw new Error("requireBrandContext: no brand resolved from host");
  }
  return brand;
}
