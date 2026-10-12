import { Component, computed, signal } from '@angular/core';
import {
  CATEGORIES, Draft, PAGE_SIZES, Product, SortKey, computeMetrics, filterAndSort, generateProducts, nextId, toProduct,
} from './data';
import { BenchBarComponent } from './components/bench-bar.component';
import { DashboardComponent } from './components/dashboard.component';
import { ProductTableComponent } from './components/product-table.component';
import { ProductFormComponent } from './components/product-form.component';

@Component({
  selector: 'app-root',
  imports: [BenchBarComponent, DashboardComponent, ProductTableComponent, ProductFormComponent],
  template: `
    <div class="app">
      <header class="top"><h1>InventoryPro <span class="fw">Angular 19</span></h1></header>
      <app-bench-bar [total]="products().length" [shown]="rows().length" (insert)="insert($event)" (clear)="clear()" />
      <app-dashboard [metrics]="metrics()" />

      <div class="toolbar">
        <input type="search" placeholder="Buscar por nombre, SKU o categoría…" [value]="query()" (input)="onQuery($any($event.target).value)" />
        <select [value]="category()" (change)="category.set($any($event.target).value); page.set(1)">
          <option value="">Todas las categorías</option>
          @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
        </select>
        <select (change)="pageSize.set(+$any($event.target).value); page.set(1)">
          @for (n of pageSizes; track n) {
            <option [value]="n" [selected]="n === pageSize()">{{ n === 0 ? 'Todas las filas' : n + ' por página' }}</option>
          }
        </select>
        <span class="sp"></span>
        @if (selected().size > 0) {
          <span>{{ selected().size }} seleccionados</span>
          <button (click)="bulkRestock()">+10 stock</button>
          <button class="dng" (click)="bulkDelete()">Eliminar</button>
        }
        <button class="pri" (click)="editing.set('new')">+ Nuevo producto</button>
      </div>

      <app-product-table
        [rows]="rows()" [selected]="selected()" [sortKey]="sortKey()" [sortDir]="sortDir()"
        (sort)="toggleSort($event)" (toggle)="toggleRow($event)" (toggleAll)="toggleAll()"
        (edit)="editing.set($event)" (remove)="removeOne($event)" />

      <div class="pager">
        <span>{{ filtered().length }} resultados</span>
        <button [disabled]="current() <= 1" (click)="page.set(current() - 1)">◀</button>
        <span>Página {{ current() }} / {{ pageCount() }}</span>
        <button [disabled]="current() >= pageCount()" (click)="page.set(current() + 1)">▶</button>
      </div>

      @if (editing(); as e) {
        <app-product-form [product]="e === 'new' ? null : e" [products]="products()" (save)="save($event)" (cancel)="editing.set(null)" />
      }
    </div>
  `,
})
export class AppComponent {
  readonly categories = CATEGORIES;
  readonly pageSizes = PAGE_SIZES;

  products = signal<Product[]>(generateProducts(1000));
  query = signal('');
  category = signal('');
  sortKey = signal<SortKey>('id');
  sortDir = signal<'asc' | 'desc'>('asc');
  page = signal(1);
  pageSize = signal(50);
  selected = signal<Set<number>>(new Set());
  editing = signal<Product | 'new' | null>(null);

  filtered = computed(() =>
    filterAndSort(this.products(), { query: this.query(), category: this.category(), sortKey: this.sortKey(), sortDir: this.sortDir() })
  );
  metrics = computed(() => computeMetrics(this.products()));
  pageCount = computed(() => (this.pageSize() === 0 ? 1 : Math.max(1, Math.ceil(this.filtered().length / this.pageSize()))));
  current = computed(() => Math.min(this.page(), this.pageCount()));
  rows = computed(() => {
    const size = this.pageSize();
    return size === 0 ? this.filtered() : this.filtered().slice((this.current() - 1) * size, this.current() * size);
  });

  onQuery(v: string) { this.query.set(v); this.page.set(1); }
  insert(n: number) {
    this.products.set(generateProducts(n)); this.resetControls();
  }
  clear() {
    this.products.set([]); this.resetControls();
  }
  private resetControls() {
    this.page.set(1); this.selected.set(new Set()); this.query.set(''); this.category.set(''); this.editing.set(null);
  }
  toggleSort(key: SortKey) {
    this.sortDir.set(this.sortKey() === key && this.sortDir() === 'asc' ? 'desc' : 'asc');
    this.sortKey.set(key);
  }
  toggleRow(id: number) {
    const n = new Set(this.selected());
    n.has(id) ? n.delete(id) : n.add(id);
    this.selected.set(n);
  }
  toggleAll() {
    const sel = this.selected();
    const allOn = this.rows().every((r) => sel.has(r.id));
    const n = new Set(sel);
    this.rows().forEach((r) => (allOn ? n.delete(r.id) : n.add(r.id)));
    this.selected.set(n);
  }
  removeOne(id: number) {
    this.products.update((ps) => ps.filter((p) => p.id !== id));
    if (this.selected().has(id)) this.toggleRow(id);
  }
  bulkDelete() { this.products.update((ps) => ps.filter((p) => !this.selected().has(p.id))); this.selected.set(new Set()); }
  bulkRestock() { this.products.update((ps) => ps.map((p) => (this.selected().has(p.id) ? { ...p, stock: p.stock + 10 } : p))); }
  save(draft: Draft) {
    const e = this.editing();
    if (e === 'new') this.products.update((ps) => [...ps, toProduct(draft, nextId(ps))]);
    else if (e) this.products.update((ps) => ps.map((p) => (p.id === e.id ? toProduct(draft, p.id) : p)));
    this.editing.set(null);
  }
}
