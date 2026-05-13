"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { BrandSlide } from "@/lib/queries/brands";

interface HeroCarouselProps {
  slides: BrandSlide[];
  accent: string;
  /** ms entre slides. 0 desactiva auto-rotate. */
  intervalMs?: number;
}

export function HeroCarousel({ slides, accent, intervalMs = 6000 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || intervalMs <= 0 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs, paused]);

  if (slides.length === 0) return null;

  const current = slides[index];
  const isExternal = current.cta_href?.startsWith("http");

  const goPrev = () =>
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      className="relative overflow-hidden border-b border-border/50"
      style={{ background: `linear-gradient(135deg, ${accent}14 0%, transparent 60%)` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* Imagen de fondo (si hay) */}
        {current.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.image_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}

        <div className="relative px-6 lg:px-8 pt-16 pb-16 lg:pb-24">
          <div className="max-w-3xl">
            <h1
              key={`title-${index}`}
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight font-serif"
            >
              {current.title}
            </h1>
            {current.subtitle && (
              <p
                key={`subtitle-${index}`}
                className="mt-4 text-lg lg:text-xl text-muted-foreground leading-relaxed"
              >
                {current.subtitle}
              </p>
            )}
            {current.cta_label && current.cta_href && (
              <div className="mt-8">
                {isExternal ? (
                  <a
                    href={current.cta_href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-[0.875rem] font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: accent }}
                  >
                    {current.cta_label}
                  </a>
                ) : (
                  <Link
                    href={current.cta_href}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-[0.875rem] font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: accent }}
                  >
                    {current.cta_label}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ir al slide ${i + 1}`}
                  aria-current={i === index}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === index ? 24 : 8,
                    backgroundColor: i === index ? accent : `${accent}55`,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
