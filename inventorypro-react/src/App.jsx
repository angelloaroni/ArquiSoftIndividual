import { useCallback, useMemo, useState } from 'react';
import { CATEGORIES, PAGE_SIZES, afterPaint, computeMetrics, filterAndSort, generateProducts, nextId, toProduct } from './data.js';
import BenchBar from './components/BenchBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProductTable from './components/ProductTable.jsx';
import ProductForm from './components/ProductForm.jsx';

export default function App() {
  const [products, setProducts] = useState(() => generateProducts(1000));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState({ key: 'id', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selected, setSelected] = useState(() => new Set());
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [bench, setBench] = useState({ render: null, filter: null });

  const filtered = useMemo(
    () => filterAndSort(products, { query, category, sortKey: sort.key, sortDir: sort.dir }),
    [products, query, category, sort]
  );
  const metrics = useMemo(() => computeMetrics(products), [products]);
  const pageCount = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = useMemo(
    () => (pageSize === 0 ? filtered : filtered.slice((current - 1) * pageSize, current * pageSize)),
    [filtered, current, pageSize]
  );

  const measure = (key, fn) => {
    const t0 = performance.now();
    fn();
    afterPaint(() => setBench((b) => ({ ...b, [key]: performance.now() - t0 })));
  };

  const onQuery = (v) => measure('filter', () => { setQuery(v); setPage(1); });
  const insert = (n) => {
    const data = generateProducts(n);
    measure('render', () => { setProducts(data); setPage(1); setSelected(new Set()); setQuery(''); setCategory(''); });
  };
  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  const toggleRow = useCallback((id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
  const toggleAll = () => setSelected((s) => {
    const allOn = rows.every((r) => s.has(r.id));
    const n = new Set(s);
    rows.forEach((r) => (allOn ? n.delete(r.id) : n.add(r.id)));
    return n;
  });
  const removeOne = useCallback((id) => {
    setProducts((ps) => ps.filter((p) => p.id !== id));
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
  }, []);
  const bulkDelete = () => { setProducts((ps) => ps.filter((p) => !selected.has(p.id))); setSelected(new Set()); };
  const bulkRestock = () => setProducts((ps) => ps.map((p) => (selected.has(p.id) ? { ...p, stock: p.stock + 10 } : p)));
  const save = (draft) => {
    if (editing === 'new') setProducts((ps) => [...ps, toProduct(draft, nextId(ps))]);
    else setProducts((ps) => ps.map((p) => (p.id === editing.id ? toProduct(draft, p.id) : p)));
    setEditing(null);
  };

  return (
    <div className="app">
      <header className="top"><h1>InventoryPro <span className="fw">React 18</span></h1></header>
      <BenchBar bench={bench} total={products.length} shown={rows.length} onInsert={insert} />
      <Dashboard metrics={metrics} />

      <div className="toolbar">
        <input type="search" placeholder="Buscar por nombre, SKU o categoría…" value={query} onChange={(e) => onQuery(e.target.value)} />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {PAGE_SIZES.map((n) => <option key={n} value={n}>{n === 0 ? 'Todas las filas' : `${n} por página`}</option>)}
        </select>
        <span className="sp" />
        {selected.size > 0 && (<>
          <span>{selected.size} seleccionados</span>
          <button onClick={bulkRestock}>+10 stock</button>
          <button className="dng" onClick={bulkDelete}>Eliminar</button>
        </>)}
        <button className="pri" onClick={() => setEditing('new')}>+ Nuevo producto</button>
      </div>

      <ProductTable rows={rows} selected={selected} sort={sort} onSort={toggleSort} onToggle={toggleRow} onToggleAll={toggleAll} onEdit={setEditing} onDelete={removeOne} />

      <div className="pager">
        <span>{filtered.length} resultados</span>
        <button disabled={current <= 1} onClick={() => setPage(current - 1)}>◀</button>
        <span>Página {current} / {pageCount}</span>
        <button disabled={current >= pageCount} onClick={() => setPage(current + 1)}>▶</button>
      </div>

      {editing && <ProductForm product={editing === 'new' ? null : editing} products={products} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  );
}
