
export default function BenchBar({ total, shown, onInsert, onClear }) {
  return (
    <div className="bench">
      <strong>Benchmark</strong>
      {[1000, 2000, 5000].map((n) => <button key={n} onClick={() => onInsert(n)}>Insertar {n.toLocaleString()}</button>)}
      <button className="dng" disabled={total === 0} onClick={onClear}>Limpiar registros</button>
      <span className="sp" />
      <span>Filas en DOM: <b>{shown}</b> / {total}</span>
    </div>
  );
}
