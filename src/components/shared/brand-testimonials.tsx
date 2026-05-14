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
      className="py-24 lg:py-32 bg-secondary/30 border-y border-border/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Testimonios de clientes"
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
            style={{ color: accent }}
          >
            Testimonios
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight font-serif leading-[1.1]">
            Lo que dicen nuestros clientes
          </h2>
          <div
            aria-hidden="true"
            className="mt-8 mx-auto h-1 w-16 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>

        <div className="relative">
          <article
            key={current.id}
            className="bg-background border border-border/40 rounded-xl p-8 sm:p-10 lg:p-14 shadow-sm"
            aria-roledescription="slide"
            aria-label={`Testimonio ${safeIndex + 1} de ${testimonials.length}`}
          >
            <Quote
              className="h-10 w-10 mb-6"
              style={{ color: accent, opacity: 0.6 }}
              aria-hidden="true"
            />

            {current.rating != null && current.rating > 0 && (
              <div
                className="flex items-center gap-1 mb-6"
                aria-label={`Calificación ${current.rating} de 5`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="h-5 w-5"
                    style={
                      n <= (current.rating ?? 0)
                        ? { color: accent, fill: accent }
                        : { color: "rgb(var(--muted-foreground) / 0.25)" }
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}

            <blockquote className="text-xl sm:text-2xl lg:text-[1.625rem] leading-relaxed text-foreground/90 font-serif italic">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            <div
              className="mt-10 pt-8 flex items-center gap-5 border-t"
              style={{ borderColor: `${accent}22` }}
            >
              <div className="h-16 w-16 rounded-full overflow-hidden bg-secondary/40 border border-border/40 flex-shrink-0">
                {current.author_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.author_photo_url}
                    alt={current.author_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                    <UserRound className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground truncate font-serif">
                  {current.author_name}
                </p>
                {(current.author_role || current.author_company) && (
                  <p
                    className="mt-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] truncate"
                    style={{ color: accent }}
                  >
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
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Testimonio anterior"
                  className="h-11 w-11 rounded-full bg-background border border-border/40 flex items-center justify-center hover:bg-secondary/60 transition-colors shadow-sm"
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
                        width: i === safeIndex ? 28 : 8,
                        backgroundColor: i === safeIndex ? accent : `${accent}40`,
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Testimonio siguiente"
                  className="h-11 w-11 rounded-full bg-background border border-border/40 flex items-center justify-center hover:bg-secondary/60 transition-colors shadow-sm"
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
