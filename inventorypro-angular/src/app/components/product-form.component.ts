import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { CATEGORIES, Draft, Product, emptyDraft, toDraft, validateProduct } from '../data';

@Component({
  selector: 'app-product-form',
  template: `
    <div class="backdrop" (click)="cancel.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>{{ product() ? 'Editar producto' : 'Nuevo producto' }}</h2>
        <div class="field"><label>SKU</label><input [value]="draft().sku" [class.bad]="errors().sku" (input)="set('sku', $event)" /><span class="err">{{ errors().sku }}</span></div>
        <div class="field"><label>Nombre</label><input [value]="draft().name" [class.bad]="errors().name" (input)="set('name', $event)" /><span class="err">{{ errors().name }}</span></div>
        <div class="field"><label>Categoría</label>
          <select (change)="set('category', $event)">
            @for (c of categories; track c) { <option [value]="c" [selected]="c === draft().category">{{ c }}</option> }
          </select>
          <span class="err">{{ errors().category }}</span>
        </div>
        <div class="row2">
          <div class="field"><label>Stock</label><input type="number" [value]="draft().stock" [class.bad]="errors().stock" (input)="set('stock', $event)" /><span class="err">{{ errors().stock }}</span></div>
          <div class="field"><label>Stock mínimo</label><input type="number" [value]="draft().minStock" [class.bad]="errors().minStock" (input)="set('minStock', $event)" /><span class="err">{{ errors().minStock }}</span></div>
          <div class="field"><label>Precio (S/)</label><input type="number" step="0.01" [value]="draft().price" [class.bad]="errors().price" (input)="set('price', $event)" /><span class="err">{{ errors().price }}</span></div>
        </div>
        <div class="actions">
          <button (click)="cancel.emit()">Cancelar</button>
          <button class="pri" [disabled]="!valid()" (click)="save.emit(draft())">Guardar</button>
        </div>
      </div>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  product = input<Product | null>(null);
  products = input.required<Product[]>();
  save = output<Draft>();
  cancel = output<void>();

  readonly categories = CATEGORIES;
  draft = signal<Draft>(emptyDraft());
  errors = computed(() => validateProduct(this.draft(), this.products(), this.product()?.id ?? null));
  valid = computed(() => Object.keys(this.errors()).length === 0);

  ngOnInit() {
    const p = this.product();
    if (p) this.draft.set(toDraft(p));
  }
  set(field: keyof Draft, ev: Event) {
    this.draft.update((d) => ({ ...d, [field]: (ev.target as HTMLInputElement).value }));
  }
}
