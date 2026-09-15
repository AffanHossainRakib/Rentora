export type PageToken = number | "gap";

export function paginationRange(
  page: number,
  totalPage: number,
  siblings = 1,
): PageToken[] {
  const total = Math.max(1, totalPage);
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  const tokens: PageToken[] = [1];

  if (left > 2) tokens.push("gap");
  for (let i = left; i <= right; i += 1) tokens.push(i);
  if (right < total - 1) tokens.push("gap");
  tokens.push(total);

  return tokens;
}
