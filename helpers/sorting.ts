// Утилиты сортировки и парсинга цен/строк

export function parsePrice(text: string): number {
  // "$29.99" -> 29.99
  return Number(text.replace(/[^0-9.]/g, ''));
}

export function byNameAsc(a: string, b: string) {
  return a.localeCompare(b);
}
export function byNameDesc(a: string, b: string) {
  return b.localeCompare(a);
}

export function byPriceAsc(a: number, b: number) {
  return a - b;
}
export function byPriceDesc(a: number, b: number) {
  return b - a;
}
