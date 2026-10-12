import { money } from '../data.js';

export default function Dashboard({ metrics: m }) {
  return (
    <div className="cards">
      <div className="card"><div className="l">SKUs</div><div className="v">{m.skus.toLocaleString()}</div></div>
      <div className="card"><div className="l">Unidades totales</div><div className="v">{m.totalUnits.toLocaleString()}</div></div>
      <div className="card"><div className="l">Stock crítico</div><div className="v crit">{m.criticalCount}</div><small>{m.criticalUnits} unidades en riesgo</small></div>
      <div className="card"><div className="l">Valorizado de almacén</div><div className="v">{money(m.value)}</div></div>
      <div className="card alerts"><div className="l">Alertas de reabastecimiento</div>
        <ul>{m.topAlerts.map((p) => <li key={p.id}>{p.sku} · {p.name} ({p.stock}/{p.minStock})</li>)}</ul>
      </div>
    </div>
  );
}
