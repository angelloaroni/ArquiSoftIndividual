import { Component, computed, input, output } from '@angular/core';
import { Product, SortKey, STATUS_LABEL, money, stockStatus } from '../data';

@Component({
  selector: 'app-product-table',
  template: `
    <div class="tablewrap" style="max-height: 520px">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" [checked]="allOn()" (change)="toggleAll.emit()" /></th>
            @for (c of cols; track c[0]) {
              <th [class]="'s ' + (c[2] ?? '')" (click)="sort.emit(c[0])">{{ c[1] }}{{ sortKey() === c[0] ? (sortDir() === 'asc' ? ' ▲' : ' ▼') : '' }}</th>
            }
            <th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          @for (p of rows(); track p.id) {
            @let st = status(p);
            <tr [class.sel]="selected().has(p.id)">
              <td><input type="checkbox" [checked]="selected().has(p.id)" (change)="toggle.emit(p.id)" /></td>
              <td>{{ p.sku }}</td><td>{{ p.name }}</td><td>{{ p.category }}</td>
              <td class="n">{{ p.stock }}</td><td class="n">{{ p.minStock }}</td><td class="n">{{ money(p.price) }}</td>
              <td><span [class]="'badge ' + st">{{ label[st] }}</span></td>
              <td class="act"><button (click)="edit.emit(p)">Editar</button><button class="dng" (click)="remove.emit(p.id)">✕</button></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ProductTableComponent {
  rows = input.required<Product[]>();
  selected = input.required<Set<number>>();
  sortKey = input.required<SortKey>();
  sortDir = input.required<'asc' | 'desc'>();
  sort = output<SortKey>();
  toggle = output<number>();
  toggleAll = output<void>();
  edit = output<Product>();
  remove = output<number>();

  readonly cols: [SortKey, string, string?][] = [
    ['sku', 'SKU'], ['name', 'Producto'], ['category', 'Categoría'], ['stock', 'Stock', 'n'], ['minStock', 'Mín.', 'n'], ['price', 'Precio', 'n'],
  ];
  readonly label = STATUS_LABEL;
  money = money;
  status = stockStatus;
  allOn = computed(() => this.rows().length > 0 && this.rows().every((r) => this.selected().has(r.id)));
}
