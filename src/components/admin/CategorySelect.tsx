import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/server";

interface CategorySelectProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
}

export async function CategorySelect({ name, defaultValue, required }: CategorySelectProps) {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order", { ascending: true });

  return (
    <Select name={name} defaultValue={defaultValue ?? null} required={required}>
      <SelectTrigger className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground">
        <SelectValue placeholder="Seleccionar categoría" />
      </SelectTrigger>
      <SelectContent>
        {(categories ?? []).map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
