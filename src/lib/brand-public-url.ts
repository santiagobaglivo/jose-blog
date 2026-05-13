import { headers } from "next/headers";

/**
 * Devuelve la URL pública absoluta de una brand (siempre al subdomain de la brand,
 * NUNCA al admin host con path local).
 *
 * - Si la brand tiene `domain` configurado: arma `<protocol>://<domain><path>`.
 * - Si NO tiene domain: devuelve null para que el caller no muestre el link
 *   (o muestre un estado "sin dominio").
 *
 * El protocolo se detecta de x-forwarded-proto. Fallback: http para sslip.io
 * y localhost; https para todo lo demás.
 */
export async function publicBrandUrl(
  brand: { slug: string; domain: string | null },
  path: string = "/"
): Promise<string | null> {
  if (!brand.domain) return null;

  const h = await headers();
  const forwardedProto = h.get("x-forwarded-proto");
  let protocol = forwardedProto;
  if (!protocol) {
    const hostHeader = (h.get("host") ?? "").toLowerCase();
    protocol =
      hostHeader.endsWith(".sslip.io") ||
      hostHeader === "localhost" ||
      hostHeader.endsWith(".localhost") ||
      hostHeader.startsWith("127.") ||
      hostHeader.startsWith("192.168.")
        ? "http"
        : "https";
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${protocol}://${brand.domain}${normalizedPath}`;
}
