import { Component, input } from '@angular/core';
import { computeMetrics, money } from '../data';

@Component({
  selector: 'app-dashboard',
  template: `
    @let m = metrics();
    <div class="cards">
      <div class="card"><div class="l">SKUs</div><div class="v">{{ m.skus.toLocaleString() }}</div></div>
      <div class="card"><div class="l">Unidades totales</div><div class="v">{{ m.totalUnits.toLocaleString() }}</div></div>
      <div class="card"><div class="l">Stock crítico</div><div class="v crit">{{ m.criticalCount }}</div><small>{{ m.criticalUnits }} unidades en riesgo</small></div>
      <div class="card"><div class="l">Valorizado de almacén</div><div class="v">{{ money(m.value) }}</div></div>
      <div class="card alerts"><div class="l">Alertas de reabastecimiento</div>
        <ul>@for (p of m.topAlerts; track p.id) { <li>{{ p.sku }} · {{ p.name }} ({{ p.stock }}/{{ p.minStock }})</li> }</ul>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  metrics = input.required<ReturnType<typeof computeMetrics>>();
  money = money;
}
