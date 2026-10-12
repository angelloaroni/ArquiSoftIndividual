const fmt = (v) => (v == null ? '—' : v.toFixed(1) + ' ms');

export default function BenchBar({ bench, total, shown, onInsert }) {
  return (
    <div className="bench">
      <strong>Benchmark</strong>
      {[1000, 2000, 5000].map((n) => <button key={n} onClick={() => onInsert(n)}>Insertar {n.toLocaleString()}</button>)}
      <span className="sp" />
      <span>Último render: <b>{fmt(bench.render)}</b></span>
      <span>Último filtro: <b>{fmt(bench.filter)}</b></span>
      <span>Filas en DOM: <b>{shown}</b> / {total}</span>
    </div>
  );
}
