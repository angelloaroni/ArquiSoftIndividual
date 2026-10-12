// Lógica de dominio COMPARTIDA (sin dependencias de framework).
// Es idéntica en los 4 proyectos para que la comparación mida solo la capa de UI/reactividad.
export const CATEGORIES = ['Electrónica', 'Hogar', 'Herramientas', 'Oficina', 'Ferretería', 'Limpieza', 'Alimentos', 'Juguetes'];
export const PAGE_SIZES = [25, 50, 100, 0]; // 0 = todas (estrés de DOM)
export const STATUS_LABEL = { out: 'Agotado', low: 'Crítico', ok: 'OK' };

const NOUNS = ['Taladro', 'Cable', 'Monitor', 'Silla', 'Lámpara', 'Detergente', 'Arroz', 'Martillo', 'Teclado', 'Cuaderno', 'Muñeco', 'Tornillo', 'Mouse', 'Escoba', 'Aceite'];
const ADJS = ['Pro', 'Plus', 'Eco', 'Max', 'Mini', 'Ultra', 'Básico', 'Premium', 'Compacto', 'Industrial'];

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function generateProducts(n, seed = 42) {
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

export function stockStatus(p) {
  return p.stock === 0 ? 'out' : p.stock <= p.minStock ? 'low' : 'ok';
}

export function filterAndSort(products, { query, category, sortKey, sortDir }) {
  const q = query.trim().toLowerCase();
  const res = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  );
  const k = sortKey;
  res.sort((a, b) => {
    const c = typeof a[k] === 'number' ? a[k] - b[k] : String(a[k]).localeCompare(String(b[k]));
    return sortDir === 'asc' ? c : -c;
  });
  return res;
}

export function computeMetrics(products) {
  let totalUnits = 0, criticalUnits = 0, criticalCount = 0, value = 0;
  const critical = [];
  for (const p of products) {
    totalUnits += p.stock;
    value += p.stock * p.price;
    if (p.stock <= p.minStock) { criticalCount++; criticalUnits += p.stock; critical.push(p); }
  }
  critical.sort((a, b) => a.stock - a.minStock - (b.stock - b.minStock));
  return { totalUnits, criticalUnits, criticalCount, value, topAlerts: critical.slice(0, 5), skus: products.length };
}

export const money = (n) => 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const nextId = (products) => products.reduce((m, p) => Math.max(m, p.id), 0) + 1;

export const emptyDraft = () => ({ sku: '', name: '', category: CATEGORIES[0], stock: '0', minStock: '10', price: '' });
export const toDraft = (p) => ({ sku: p.sku, name: p.name, category: p.category, stock: String(p.stock), minStock: String(p.minStock), price: String(p.price) });
export const toProduct = (d, id) => ({
  id, sku: d.sku.trim().toUpperCase(), name: d.name.trim(), category: d.category,
  stock: Number(d.stock), minStock: Number(d.minStock), price: Number(d.price),
});

export function validateProduct(d, products, editingId) {
  const e = {};
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
export const afterPaint = (cb) => requestAnimationFrame(() => setTimeout(cb, 0));
