import { Plus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Artículos
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Gestión de publicaciones del blog
          </p>
        </div>
        <div className="inline-flex h-10 px-4 items-center gap-2 bg-primary/80 text-primary-foreground text-[0.8125rem] font-medium rounded-lg">
          <Plus className="h-4 w-4" />
          Nuevo artículo
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <Skeleton className="h-10 w-full sm:w-72" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-7 w-20" />
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50 flex items-center gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="hidden md:block h-3 w-20" />
          <Skeleton className="hidden lg:block h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="hidden sm:block h-3 w-16" />
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-72 max-w-full" />
                <Skeleton className="h-3 w-96 max-w-full" />
              </div>
              <Skeleton className="hidden md:block h-5 w-20" />
              <Skeleton className="hidden lg:block h-3 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="hidden sm:block h-3 w-28" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
