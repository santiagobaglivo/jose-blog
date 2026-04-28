"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  name?: string;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = "Buscar artículos...",
  className,
  name,
  defaultValue,
}: SearchBarProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 bg-secondary/50 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
      />
    </div>
  );
}
