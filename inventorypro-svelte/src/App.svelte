<script>
  import { CATEGORIES, PAGE_SIZES, afterPaint, computeMetrics, filterAndSort, generateProducts, nextId, toProduct } from './data.js';
  import BenchBar from './components/BenchBar.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import ProductTable from './components/ProductTable.svelte';
  import ProductForm from './components/ProductForm.svelte';

  let products = $state(generateProducts(1000)); // proxy profundo (runes)
  let query = $state('');
  let category = $state('');
  let sort = $state({ key: 'id', dir: 'asc' });
  let page = $state(1);
  let pageSize = $state(50);
  let selected = $state(new Set());
  let editing = $state(null); // null | 'new' | product
  let bench = $state({ render: null, filter: null });

  const filtered = $derived(filterAndSort(products, { query, category, sortKey: sort.key, sortDir: sort.dir }));
  const metrics = $derived(computeMetrics(products));
  const pageCount = $derived(pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize)));
  const current = $derived(Math.min(page, pageCount));
  const rows = $derived(pageSize === 0 ? filtered : filtered.slice((current - 1) * pageSize, current * pageSize));

  function measure(key, fn) {
    const t0 = performance.now();
    fn();
    afterPaint(() => (bench[key] = performance.now() - t0));
  }
  const onQuery = (v) => measure('filter', () => { query = v; page = 1; });
  function insert(n) {
    const data = generateProducts(n);
    measure('render', () => { products = data; page = 1; selected = new Set(); query = ''; category = ''; });
  }
  const toggleSort = (key) => (sort = { key, dir: sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc' });
  function toggleRow(id) {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    selected = n;
  }
  function toggleAll() {
    const allOn = rows.every((r) => selected.has(r.id));
    const n = new Set(selected);
    rows.forEach((r) => (allOn ? n.delete(r.id) : n.add(r.id)));
    selected = n;
  }
  function removeOne(id) {
    products = products.filter((p) => p.id !== id);
    if (selected.has(id)) toggleRow(id);
  }
  function bulkDelete() { products = products.filter((p) => !selected.has(p.id)); selected = new Set(); }
  function bulkRestock() { products = products.map((p) => (selected.has(p.id) ? { ...p, stock: p.stock + 10 } : p)); }
  function save(draft) {
    if (editing === 'new') products = [...products, toProduct(draft, nextId(products))];
    else products = products.map((p) => (p.id === editing.id ? toProduct(draft, p.id) : p));
    editing = null;
  }
</script>

<div class="app">
  <header class="top"><h1>InventoryPro <span class="fw">Svelte 5</span></h1></header>
  <BenchBar {bench} total={products.length} shown={rows.length} onInsert={insert} />
  <Dashboard {metrics} />

  <div class="toolbar">
    <input type="search" placeholder="Buscar por nombre, SKU o categoría…" value={query} oninput={(e) => onQuery(e.target.value)} />
    <select bind:value={category} onchange={() => (page = 1)}>
      <option value="">Todas las categorías</option>
      {#each CATEGORIES as c}<option>{c}</option>{/each}
    </select>
    <select bind:value={pageSize} onchange={() => (page = 1)}>
      {#each PAGE_SIZES as n}<option value={n}>{n === 0 ? 'Todas las filas' : n + ' por página'}</option>{/each}
    </select>
    <span class="sp"></span>
    {#if selected.size > 0}
      <span>{selected.size} seleccionados</span>
      <button onclick={bulkRestock}>+10 stock</button>
      <button class="dng" onclick={bulkDelete}>Eliminar</button>
    {/if}
    <button class="pri" onclick={() => (editing = 'new')}>+ Nuevo producto</button>
  </div>

  <ProductTable {rows} {selected} {sort} onSort={toggleSort} onToggle={toggleRow} onToggleAll={toggleAll} onEdit={(p) => (editing = p)} onDelete={removeOne} />

  <div class="pager">
    <span>{filtered.length} resultados</span>
    <button disabled={current <= 1} onclick={() => (page = current - 1)}>◀</button>
    <span>Página {current} / {pageCount}</span>
    <button disabled={current >= pageCount} onclick={() => (page = current + 1)}>▶</button>
  </div>

  {#if editing}
    <ProductForm product={editing === 'new' ? null : editing} {products} onSave={save} onCancel={() => (editing = null)} />
  {/if}
</div>
