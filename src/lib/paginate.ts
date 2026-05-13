/**
 * Slice de array en página. Para listas chicas/medianas donde no vale la pena
 * cambiar a paginated SQL queries.
 */
export function paginate<T>(
  items: T[],
  pageInput: string | string[] | undefined,
  perPage = 10
): { items: T[]; total: number; page: number; totalPages: number; perPage: number } {
  const raw =
    typeof pageInput === "string"
      ? Number(pageInput)
      : Array.isArray(pageInput)
        ? Number(pageInput[0])
        : NaN;
  const page = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = (page - 1) * perPage;
  return {
    items: items.slice(from, from + perPage),
    total,
    page,
    totalPages,
    perPage,
  };
}
