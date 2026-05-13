"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  /** Nombre del query param (default "q"). */
  name?: string;
  /** Valor inicial. Si no se pasa, lee del searchParam actual. */
  defaultValue?: string;
  /** Si se pasa, submit navega a esta ruta en vez de pathname actual. */
  action?: string;
}

export function SearchBar({
  placeholder = "Buscar artículos...",
  className,
  name = "q",
  defaultValue,
  action,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = defaultValue ?? searchParams.get(name) ?? "";
  const [value, setValue] = useState(initial);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = action ?? pathname;
    const sp = new URLSearchParams(searchParams.toString());
    if (value.trim()) sp.set(name, value.trim());
    else sp.delete(name);
    // Reset page on new search.
    sp.delete("page");
    const qs = sp.toString();
    router.push(qs ? `${target}?${qs}` : target);
  };

  return (
    <form onSubmit={onSubmit} className={`relative ${className ?? ""}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
      <input
        type="search"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 bg-secondary/50 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
      />
    </form>
  );
}
