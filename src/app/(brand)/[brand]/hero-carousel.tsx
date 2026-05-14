"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { BrandSlide } from "@/lib/queries/brands";

interface HeroCarouselProps {
  slides: BrandSlide[];
  accent: string;
  /** ms entre slides. 0 desactiva auto-rotate. */
  intervalMs?: number;
}

export function HeroCarousel({ slides, accent, intervalMs = 7000 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || intervalMs <= 0 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs, paused, index]);

  if (slides.length === 0) return null;

  const current = slides[index];
  const isExternal = current.cta_href?.startsWith("http");

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-950 text-white"
      style={{ minHeight: "min(720px, 88vh)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Slide actual con cross-fade + zoom sutil */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          {/* Imagen full-bleed */}
          {current.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.image_url}
              alt={current.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}88 100%)` }}
            />
          )}

          {/* Overlay con gradiente elegante de izq→der oscurecido + bottom para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 min-h-[inherit] flex flex-col justify-end pb-24 lg:pb-32 pt-32 lg:pt-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl"
          >
            {/* Eyebrow con accent color */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="block h-px w-12"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
              <span
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-white/80"
                style={{ color: accent }}
              >
                Servicio profesional
              </span>
            </div>

            <h1 className="font-serif font-medium tracking-tight text-white leading-[1.05] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
              {current.title}
            </h1>

            {current.subtitle && (
              <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl">
                {current.subtitle}
              </p>
            )}

            {current.cta_label && current.cta_href && (
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {isExternal ? (
                  <a
                    href={current.cta_href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 h-12 px-7 rounded-full text-[0.875rem] font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                    style={{ backgroundColor: accent }}
                  >
                    {current.cta_label}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ) : (
                  <Link
                    href={current.cta_href}
                    className="group inline-flex items-center gap-2 h-12 px-7 rounded-full text-[0.875rem] font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                    style={{ backgroundColor: accent }}
                  >
                    {current.cta_label}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer del hero: contador + thumbs nav */}
        {slides.length > 1 && (
          <div className="mt-12 lg:mt-16 flex items-end justify-between gap-6 flex-wrap">
            {/* Counter + dots */}
            <div className="flex items-center gap-6">
              <div className="text-white/90 font-mono text-sm tracking-widest">
                <span className="text-white text-2xl lg:text-3xl font-light">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-white/40 mx-2">/</span>
                <span className="text-white/40">{String(slides.length).padStart(2, "0")}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Ir al slide ${i + 1}`}
                    aria-current={i === index}
                    className="group p-1"
                  >
                    <span
                      className="block h-px transition-all"
                      style={{
                        width: i === index ? 56 : 24,
                        backgroundColor: i === index ? accent : "rgba(255,255,255,0.4)",
                        height: i === index ? 2 : 1,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Slide anterior"
                className="h-12 w-12 rounded-full border border-white/20 backdrop-blur-md bg-white/5 flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Slide siguiente"
                className="h-12 w-12 rounded-full border border-white/20 backdrop-blur-md bg-white/5 flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar abajo (resetea por slide) */}
      {slides.length > 1 && intervalMs > 0 && (
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/10 z-10">
          <motion.div
            key={`progress-${current.id}`}
            initial={{ width: "0%" }}
            animate={{ width: paused ? "0%" : "100%" }}
            transition={{ duration: paused ? 0 : intervalMs / 1000, ease: "linear" }}
            className="h-full"
            style={{ backgroundColor: accent }}
          />
        </div>
      )}
    </section>
  );
}
