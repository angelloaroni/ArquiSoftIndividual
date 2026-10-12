export interface Product { id: number; sku: string; name: string; category: string; stock: number; minStock: number; price: number; }
export interface Draft { sku: string; name: string; category: string; stock: string; minStock: string; price: string; }
export type SortKey = keyof Product;
export type Errors = Partial<Record<keyof Draft, string>>;
// Lógica de dominio COMPARTIDA (sin dependencias de framework).
// Es idéntica en los 4 proyectos para que la comparación mida solo la capa de UI/reactividad.
export const CATEGORIES: string[] = ['Electrónica', 'Hogar', 'Herramientas', 'Oficina', 'Ferretería', 'Limpieza', 'Alimentos', 'Juguetes'];
export const PAGE_SIZES: number[] = [25, 50, 100, 0]; // 0 = todas (estrés de DOM)
export const STATUS_LABEL: Record<string, string> = { out: 'Agotado', low: 'Crítico', ok: 'OK' };

const NOUNS = ['Taladro', 'Cable', 'Monitor', 'Silla', 'Lámpara', 'Detergente', 'Arroz', 'Martillo', 'Teclado', 'Cuaderno', 'Muñeco', 'Tornillo', 'Mouse', 'Escoba', 'Aceite'];
const ADJS = ['Pro', 'Plus', 'Eco', 'Max', 'Mini', 'Ultra', 'Básico', 'Premium', 'Compacto', 'Industrial'];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function generateProducts(n: number, seed = 42): Product[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    sku: 'SKU-' + String(i + 1).padStart(5, '0'),
    name: `${NOUNS[Math.floor(r() * NOUNS.length)]} ${ADJS[Math.floor(r() * ADJS.length)]} ${i + 1}`,
    category: CATEGORIES[Math.floor(r() * CATEGORIES.length)],
    stock: Math.floor(r() * 150),
    minStock: Math.floor(r() * 40) + 5,
    price: Math.round((r() * 500 + 5) * 100) / 100,
  }));
}

export function stockStatus(p: Product): 'out' | 'low' | 'ok' {
  return p.stock === 0 ? 'out' : p.stock <= p.minStock ? 'low' : 'ok';
}

export function filterAndSort(products: Product[], { query, category, sortKey, sortDir }: { query: string; category: string; sortKey: SortKey; sortDir: 'asc' | 'desc' }): Product[] {
  const q = query.trim().toLowerCase();
  const res = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  );
  const k = sortKey;
  res.sort((a, b) => {
    const x = a[k], y = b[k];
    const c = typeof x === 'number' ? x - (y as number) : String(x).localeCompare(String(y));
    return sortDir === 'asc' ? c : -c;
  });
  return res;
}

export function computeMetrics(products: Product[]) {
  let totalUnits = 0, criticalUnits = 0, criticalCount = 0, value = 0;
  const critical: Product[] = [];
  for (const p of products) {
    totalUnits += p.stock;
    value += p.stock * p.price;
    if (p.stock <= p.minStock) { criticalCount++; criticalUnits += p.stock; critical.push(p); }
  }
  critical.sort((a, b) => a.stock - a.minStock - (b.stock - b.minStock));
  return { totalUnits, criticalUnits, criticalCount, value, topAlerts: critical.slice(0, 5), skus: products.length };
}

export const money = (n: number) => 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const nextId = (products: Product[]) => products.reduce((m, p) => Math.max(m, p.id), 0) + 1;

export const emptyDraft = (): Draft => ({ sku: '', name: '', category: CATEGORIES[0], stock: '0', minStock: '10', price: '' });
export const toDraft = (p: Product): Draft => ({ sku: p.sku, name: p.name, category: p.category, stock: String(p.stock), minStock: String(p.minStock), price: String(p.price) });
export const toProduct = (d: Draft, id: number): Product => ({
  id, sku: d.sku.trim().toUpperCase(), name: d.name.trim(), category: d.category,
  stock: Number(d.stock), minStock: Number(d.minStock), price: Number(d.price),
});

export function validateProduct(d: Draft, products: Product[], editingId: number | null): Errors {
  const e: Errors = {};
  const sku = d.sku.trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,20}$/.test(sku)) e.sku = 'SKU de 4–20 caracteres (A-Z, 0-9, guion).';
  else if (products.some((p) => p.sku === sku && p.id !== editingId)) e.sku = 'Este SKU ya existe.';
  if (d.name.trim().length < 3) e.name = 'Mínimo 3 caracteres.';
  if (!d.category) e.category = 'Selecciona una categoría.';
  if (d.stock === '' || !Number.isInteger(Number(d.stock)) || Number(d.stock) < 0) e.stock = 'Entero ≥ 0.';
  if (d.minStock === '' || !Number.isInteger(Number(d.minStock)) || Number(d.minStock) < 0) e.minStock = 'Entero ≥ 0.';
  if (d.price === '' || !(Number(d.price) > 0)) e.price = 'Debe ser > 0.';
  return e;
}

// Mide hasta que el navegador pintó (rAF + macrotask) para capturar scripting + render + layout.
export const afterPaint = (cb: () => void) => requestAnimationFrame(() => setTimeout(cb, 0));
