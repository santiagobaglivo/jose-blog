import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

// dominio: subdominios, letras minúsculas, números, guiones, sin protocolo, sin path.
// Acepta tanto producción (escudotributario.pe) como dev (escudotributario.local).
const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

export const brandServiceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(2, "El nombre del servicio debe tener al menos 2 caracteres")
    .max(200, "Máximo 200 caracteres"),
  description: z
    .string()
    .trim()
    .max(600, "Máximo 600 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const brandSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "El slug debe tener al menos 2 caracteres")
    .max(80, "Máximo 80 caracteres")
    .regex(slugRegex, "Formato inválido. Solo minúsculas, números y guiones"),
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .max(253, "Máximo 253 caracteres")
    .regex(domainRegex, "Formato inválido. Ej: escudotributario.pe (sin http://, sin /)")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "Máximo 120 caracteres"),
  tagline: z
    .string()
    .trim()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  hero_image: z
    .string()
    .trim()
    .url("URL inválida")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  about_text: z
    .string()
    .trim()
    .min(20, "El texto institucional debe tener al menos 20 caracteres")
    .max(4000, "Máximo 4000 caracteres"),
  asesoria_text: z
    .string()
    .trim()
    .max(4000, "Máximo 4000 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  accent_color: z
    .string()
    .trim()
    .regex(hexColorRegex, "Color inválido. Usá formato hex (#RRGGBB)")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  seo_title: z
    .string()
    .trim()
    .max(160, "Máximo 160 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  seo_description: z
    .string()
    .trim()
    .max(300, "Máximo 300 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  services: z.array(brandServiceSchema).default([]),
});

export type BrandInput = z.infer<typeof brandSchema>;
export type BrandServiceInput = z.infer<typeof brandServiceSchema>;
