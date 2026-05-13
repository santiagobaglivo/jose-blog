"use client";

import { useEffect, useRef, useState } from "react";

import type { BrandStat } from "@/lib/queries/brands";

interface BrandStatsProps {
  stats: BrandStat[];
  accent: string;
}

/**
 * Sección de cifras destacadas para la home de cada marca.
 * Cada tarjeta anima el número desde 0 hasta su valor cuando entra a viewport,
 * usando IntersectionObserver. Si el valor no es numérico (ej. "37+", "Top 5"),
 * se renderiza tal cual sin animación.
 *
 * Decisión de diseño: el `value` se guarda como text en DB para soportar
 * formatos abiertos. La animación intenta parsearlo y, si encuentra un número,
 * extrae el prefix/suffix textual para no romper formatos como "14K" o "+200".
 */
export function BrandStats({ stats, accent }: BrandStatsProps) {
  if (stats.length === 0) return null;

  const colsClass =
    stats.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : stats.length === 3
        ? "sm:grid-cols-3"
        : stats.length === 2
          ? "sm:grid-cols-2"
          : "sm:grid-cols-1";

  return (
    <section
      className="py-14 lg:py-20 border-y border-border/50"
      style={{
        background: `linear-gradient(180deg, ${accent}08 0%, transparent 100%)`,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: accent }}
          >
            Cifras
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-serif">
            Números que nos respaldan
          </h2>
        </div>

        <ul className={`grid gap-4 ${colsClass}`}>
          {stats.map((stat) => (
            <li
              key={stat.id}
              className="rounded-xl border border-border/50 bg-card p-6 text-center"
            >
              <p className="text-4xl sm:text-5xl font-semibold tracking-tight" style={{ color: accent }}>
                <AnimatedNumber value={stat.value} />
                {stat.suffix && (
                  <span className="ml-0.5 align-baseline">{stat.suffix}</span>
                )}
              </p>
              <p className="mt-3 text-[0.875rem] text-muted-foreground leading-snug">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Anima un número desde 0 hasta su valor objetivo cuando el elemento entra al
 * viewport. Si `value` contiene un número parseable, lo separa de su parte
 * textual (ej. "14K" -> número 14 + sufijo "K") y anima sólo el número.
 * Si no es parseable, lo muestra tal cual sin animación.
 */
function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string>(() => {
    const parsed = parseNumeric(value);
    return parsed ? `${parsed.prefix}0${parsed.suffix}` : value;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const parsed = parseNumeric(value);
    if (!parsed) {
      setDisplay(value);
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setDisplay(`${parsed.prefix}${formatInteger(parsed.number)}${parsed.suffix}`);
      return;
    }

    let raf = 0;
    let started = false;

    const animate = () => {
      const duration = 1200;
      const start = performance.now();
      const target = parsed.number;

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(target * eased);
        setDisplay(`${parsed.prefix}${formatInteger(current)}${parsed.suffix}`);
        if (t < 1) raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            animate();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

/**
 * Intenta encontrar UN número entero dentro del string y separar el prefix
 * textual (ej. "+") y suffix textual (ej. "K", "M"). Devuelve null si no hay
 * un número parseable.
 */
function parseNumeric(
  raw: string
): { prefix: string; number: number; suffix: string } | null {
  const match = raw.match(/^(\D*)(\d[\d.,]*)(\D*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  // Removemos separadores de miles típicos antes de parsear.
  const normalized = numStr.replace(/[.,](?=\d{3}\b)/g, "");
  const n = Number.parseInt(normalized.replace(/[.,]/g, ""), 10);
  if (!Number.isFinite(n)) return null;
  return { prefix, number: n, suffix };
}

function formatInteger(n: number) {
  // Usamos es-AR para que el separador de miles sea "." y no rompa visualmente.
  try {
    return new Intl.NumberFormat("es-AR").format(n);
  } catch {
    return String(n);
  }
}
