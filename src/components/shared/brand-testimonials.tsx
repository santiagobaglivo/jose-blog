"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, UserRound } from "lucide-react";

import type { BrandTestimonial } from "@/lib/queries/brands";

interface BrandTestimonialsProps {
  testimonials: BrandTestimonial[];
  accent: string;
  /** ms entre slides. 0 desactiva auto-rotate. */
  intervalMs?: number;
}

/**
 * Carrusel de testimonios de clientes para la página de marca.
 * - Auto-rotate cada 8s (pausable al hover).
 * - Controles prev/next + dots.
 * - Si hay un solo testimonio, se muestra estático sin controles.
 */
export function BrandTestimonials({
  testimonials,
  accent,
  intervalMs = 8000,
}: BrandTestimonialsProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (testimonials.length < 2 || intervalMs <= 0 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [testimonials.length, intervalMs, paused]);

  if (testimonials.length === 0) return null;

  // Defensivo: si por algún motivo el index queda fuera de rango (testimonios
  // que se actualizan sin remount), reseteamos en render.
  const safeIndex = Math.min(index, testimonials.length - 1);
  const current = testimonials[safeIndex];

  const goPrev = () =>
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const goNext = () => setIndex((i) => (i + 1) % testimonials.length);

  return (
    <section
      className="py-14 lg:py-20 border-y border-border/50"
      style={{ background: `linear-gradient(180deg, ${accent}08 0%, ${accent}14 100%)` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Testimonios de clientes"
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: accent }}
          >
            Testimonios
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-serif">
            Lo que dicen nuestros clientes
          </h2>
        </div>

        <div className="relative">
          <article
            key={current.id}
            className="bg-background border border-border/50 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm"
            aria-roledescription="slide"
            aria-label={`Testimonio ${safeIndex + 1} de ${testimonials.length}`}
          >
            <Quote
              className="h-8 w-8 mb-4 opacity-50"
              style={{ color: accent }}
              aria-hidden="true"
            />

            {current.rating != null && current.rating > 0 && (
              <div
                className="flex items-center gap-1 mb-4"
                aria-label={`Calificación ${current.rating} de 5`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${
                      n <= (current.rating ?? 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}

            <blockquote className="text-base sm:text-lg leading-relaxed text-foreground/90">
              {current.quote}
            </blockquote>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary/40 border border-border/50 flex-shrink-0">
                {current.author_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.author_photo_url}
                    alt={current.author_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                    <UserRound className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-semibold text-foreground truncate">
                  {current.author_name}
                </p>
                {(current.author_role || current.author_company) && (
                  <p className="text-[0.8125rem] text-muted-foreground truncate">
                    {[current.author_role, current.author_company]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </div>
          </article>

          {testimonials.length > 1 && (
            <>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Testimonio anterior"
                  className="h-10 w-10 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-secondary/60 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                  {testimonials.map((t, i) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Ir al testimonio ${i + 1}`}
                      aria-current={i === safeIndex}
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: i === safeIndex ? 24 : 8,
                        backgroundColor: i === safeIndex ? accent : `${accent}55`,
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Testimonio siguiente"
                  className="h-10 w-10 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-secondary/60 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
