<script setup>
import { computed, ref } from 'vue';
import { CATEGORIES, PAGE_SIZES, computeMetrics, filterAndSort, generateProducts, nextId, toProduct } from './data.js';
import BenchBar from './components/BenchBar.vue';
import Dashboard from './components/Dashboard.vue';
import ProductTable from './components/ProductTable.vue';
import ProductForm from './components/ProductForm.vue';

const products = ref(generateProducts(1000)); // ref => reactividad profunda por Proxy
const query = ref('');
const category = ref('');
const sort = ref({ key: 'id', dir: 'asc' });
const page = ref(1);
const pageSize = ref(50);
const selected = ref(new Set());
const editing = ref(null); // null | 'new' | product

const filtered = computed(() =>
  filterAndSort(products.value, { query: query.value, category: category.value, sortKey: sort.value.key, sortDir: sort.value.dir })
);
const metrics = computed(() => computeMetrics(products.value));
const pageCount = computed(() => (pageSize.value === 0 ? 1 : Math.max(1, Math.ceil(filtered.value.length / pageSize.value))));
const current = computed(() => Math.min(page.value, pageCount.value));
const rows = computed(() =>
  pageSize.value === 0 ? filtered.value : filtered.value.slice((current.value - 1) * pageSize.value, current.value * pageSize.value)
);

const onQuery = (v) => { query.value = v; page.value = 1; };
function insert(n) {
  products.value = generateProducts(n); page.value = 1; selected.value = new Set(); query.value = ''; category.value = ''; editing.value = null;
}
function clear() {
  products.value = []; page.value = 1; selected.value = new Set(); query.value = ''; category.value = ''; editing.value = null;
}
const toggleSort = (key) => (sort.value = { key, dir: sort.value.key === key && sort.value.dir === 'asc' ? 'desc' : 'asc' });
function toggleRow(id) {
  const n = new Set(selected.value);
  n.has(id) ? n.delete(id) : n.add(id);
  selected.value = n;
}
function toggleAll() {
  const allOn = rows.value.every((r) => selected.value.has(r.id));
  const n = new Set(selected.value);
  rows.value.forEach((r) => (allOn ? n.delete(r.id) : n.add(r.id)));
  selected.value = n;
}
function removeOne(id) {
  products.value = products.value.filter((p) => p.id !== id);
  toggleRowIfSelected(id);
}
function toggleRowIfSelected(id) {
  if (selected.value.has(id)) toggleRow(id);
}
function bulkDelete() { products.value = products.value.filter((p) => !selected.value.has(p.id)); selected.value = new Set(); }
function bulkRestock() { products.value = products.value.map((p) => (selected.value.has(p.id) ? { ...p, stock: p.stock + 10 } : p)); }
function save(draft) {
  if (editing.value === 'new') products.value = [...products.value, toProduct(draft, nextId(products.value))];
  else products.value = products.value.map((p) => (p.id === editing.value.id ? toProduct(draft, p.id) : p));
  editing.value = null;
}
</script>

<template>
  <div class="app">
    <header class="top"><h1>InventoryPro <span class="fw">Vue 3</span></h1></header>
    <BenchBar :total="products.length" :shown="rows.length" @insert="insert" @clear="clear" />
    <Dashboard :metrics="metrics" />

    <div class="toolbar">
      <input type="search" placeholder="Buscar por nombre, SKU o categoría…" :value="query" @input="onQuery($event.target.value)" />
      <select v-model="category" @change="page = 1">
        <option value="">Todas las categorías</option>
        <option v-for="c in CATEGORIES" :key="c">{{ c }}</option>
      </select>
      <select v-model.number="pageSize" @change="page = 1">
        <option v-for="n in PAGE_SIZES" :key="n" :value="n">{{ n === 0 ? 'Todas las filas' : n + ' por página' }}</option>
      </select>
      <span class="sp" />
      <template v-if="selected.size > 0">
        <span>{{ selected.size }} seleccionados</span>
        <button @click="bulkRestock">+10 stock</button>
        <button class="dng" @click="bulkDelete">Eliminar</button>
      </template>
      <button class="pri" @click="editing = 'new'">+ Nuevo producto</button>
    </div>

    <ProductTable :rows="rows" :selected="selected" :sort="sort" @sort="toggleSort" @toggle="toggleRow" @toggle-all="toggleAll" @edit="(p) => (editing = p)" @delete="removeOne" />

    <div class="pager">
      <span>{{ filtered.length }} resultados</span>
      <button :disabled="current <= 1" @click="page = current - 1">◀</button>
      <span>Página {{ current }} / {{ pageCount }}</span>
      <button :disabled="current >= pageCount" @click="page = current + 1">▶</button>
    </div>

    <ProductForm v-if="editing" :product="editing === 'new' ? null : editing" :products="products" @save="save" @cancel="editing = null" />
  </div>
</template>
