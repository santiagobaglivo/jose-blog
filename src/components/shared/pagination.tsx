"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  current: number;
  total: number;
  paramName?: string; // por default "page"
}

export function Pagination({ current, total, paramName = "page" }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (total <= 1) return null;

  const buildHref = (page: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (page <= 1) sp.delete(paramName);
    else sp.set(paramName, String(page));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Paginación">
      {current === 1 ? (
        <span
          aria-disabled="true"
          className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground opacity-30 pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={buildHref(current - 1)}
          className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          aria-current={page === current ? "page" : undefined}
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-md text-[0.8125rem] font-medium transition-colors",
            page === current
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          )}
        >
          {page}
        </Link>
      ))}
      {current === total ? (
        <span
          aria-disabled="true"
          className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground opacity-30 pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={buildHref(current + 1)}
          className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
