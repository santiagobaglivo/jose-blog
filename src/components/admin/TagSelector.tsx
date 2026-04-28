"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Plus, Tag as TagIcon, X } from "lucide-react";
import { toast } from "sonner";

import { createTag } from "@/app/admin/articulos/actions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type TagOption = { id: string; name: string; slug?: string };

type TagSelectorProps = {
  tags: TagOption[];
  defaultTags?: string[];
  onChange?: (tagIds: string[]) => void;
  name?: string;
  placeholder?: string;
};

export function TagSelector({
  tags: initialTags,
  defaultTags = [],
  onChange,
  name,
  placeholder = "Agregar etiquetas",
}: TagSelectorProps) {
  const [tags, setTags] = useState<TagOption[]>(initialTags);
  const [selected, setSelected] = useState<string[]>(defaultTags);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateSelected = (next: string[]) => {
    setSelected(next);
    onChange?.(next);
  };

  const toggle = (id: string) => {
    updateSelected(
      selected.includes(id)
        ? selected.filter((tagId) => tagId !== id)
        : [...selected, id]
    );
  };

  const remove = (id: string) => {
    updateSelected(selected.filter((tagId) => tagId !== id));
  };

  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const exact = useMemo(
    () => tags.some((tag) => tag.name.toLowerCase() === lower),
    [tags, lower]
  );
  const showCreate = trimmed.length > 0 && !exact;

  const handleCreate = () => {
    if (!trimmed || isPending) return;
    startTransition(async () => {
      const result = await createTag({ name: trimmed });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const created = result.tag;
      setTags((prev) =>
        prev.some((tag) => tag.id === created.id) ? prev : [...prev, created]
      );
      updateSelected(
        selected.includes(created.id) ? selected : [...selected, created.id]
      );
      setQuery("");
      toast.success(`Etiqueta "${created.name}" creada`);
    });
  };

  const selectedTags = selected
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is TagOption => Boolean(tag));

  return (
    <div className="space-y-2">
      {selectedTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 text-[0.75rem] font-medium border border-primary/30 rounded-md text-foreground bg-primary/[0.04]"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => remove(tag.id)}
                className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                aria-label={`Quitar ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full h-9 px-3 inline-flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 text-[0.8125rem] text-muted-foreground hover:text-foreground transition-colors">
          <span>
            {selectedTags.length > 0
              ? `${selectedTags.length} ${selectedTags.length === 1 ? "etiqueta" : "etiquetas"} seleccionadas`
              : placeholder}
          </span>
          <Plus className="h-3.5 w-3.5" />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar o crear etiqueta..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {!showCreate ? <CommandEmpty>Sin resultados.</CommandEmpty> : null}
              {tags.length > 0 ? (
                <CommandGroup>
                  {tags.map((tag) => {
                    const isSelected = selected.includes(tag.id);
                    return (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        data-checked={isSelected ? "true" : undefined}
                        onSelect={() => toggle(tag.id)}
                      >
                        <TagIcon className="text-muted-foreground" />
                        {tag.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
              {showCreate ? (
                <>
                  {tags.length > 0 ? <CommandSeparator /> : null}
                  <CommandGroup>
                    <CommandItem
                      forceMount
                      value={`__create__${trimmed}`}
                      onSelect={handleCreate}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin text-muted-foreground" />
                      ) : (
                        <Plus className="text-muted-foreground" />
                      )}
                      <span>
                        Crear etiqueta:{" "}
                        <strong className="text-foreground">{trimmed}</strong>
                      </span>
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {name
        ? selected.map((id) => (
            <input key={id} type="hidden" name={name} value={id} />
          ))
        : null}
    </div>
  );
}
