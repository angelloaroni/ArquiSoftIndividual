import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-bench-bar',
  template: `
    <div class="bench">
      <strong>Benchmark</strong>
      @for (n of sizes; track n) { <button (click)="insert.emit(n)">Insertar {{ n.toLocaleString() }}</button> }
      <span class="sp"></span>
      <span>Último render: <b>{{ fmt(renderMs()) }}</b></span>
      <span>Último filtro: <b>{{ fmt(filterMs()) }}</b></span>
      <span>Filas en DOM: <b>{{ shown() }}</b> / {{ total() }}</span>
    </div>
  `,
})
export class BenchBarComponent {
  renderMs = input<number | null>(null);
  filterMs = input<number | null>(null);
  total = input.required<number>();
  shown = input.required<number>();
  insert = output<number>();
  sizes = [1000, 2000, 5000];
  fmt = (v: number | null) => (v == null ? '—' : v.toFixed(1) + ' ms');
}
