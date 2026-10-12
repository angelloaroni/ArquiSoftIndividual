import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-bench-bar',
  template: `
    <div class="bench">
      <strong>Benchmark</strong>
      @for (n of sizes; track n) { <button (click)="insert.emit(n)">Insertar {{ n.toLocaleString() }}</button> }
      <button class="dng" [disabled]="total() === 0" (click)="clear.emit()">Limpiar registros</button>
      <span class="sp"></span>
      <span>Filas en DOM: <b>{{ shown() }}</b> / {{ total() }}</span>
    </div>
  `,
})
export class BenchBarComponent {
  total = input.required<number>();
  shown = input.required<number>();
  insert = output<number>();
  clear = output<void>();
  sizes = [1000, 2000, 5000];
}
