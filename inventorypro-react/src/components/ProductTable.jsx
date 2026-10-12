import { memo } from 'react';
import { STATUS_LABEL, money, stockStatus } from '../data.js';

const COLS = [['sku', 'SKU'], ['name', 'Producto'], ['category', 'Categoría'], ['stock', 'Stock', 'n'], ['minStock', 'Mín.', 'n'], ['price', 'Precio', 'n']];

const Row = memo(function Row({ p, checked, onToggle, onEdit, onDelete }) {
  const st = stockStatus(p);
  return (
    <tr className={checked ? 'sel' : ''}>
      <td><input type="checkbox" checked={checked} onChange={() => onToggle(p.id)} /></td>
      <td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td>
      <td className="n">{p.stock}</td><td className="n">{p.minStock}</td><td className="n">{money(p.price)}</td>
      <td><span className={'badge ' + st}>{STATUS_LABEL[st]}</span></td>
      <td className="act"><button onClick={() => onEdit(p)}>Editar</button><button className="dng" onClick={() => onDelete(p.id)}>✕</button></td>
    </tr>
  );
});

export default function ProductTable({ rows, selected, sort, onSort, onToggle, onToggleAll, onEdit, onDelete }) {
  const allOn = rows.length > 0 && rows.every((r) => selected.has(r.id));
  return (
    <div className="tablewrap" style={{ maxHeight: 520 }}>
      <table>
        <thead><tr>
          <th><input type="checkbox" checked={allOn} onChange={onToggleAll} /></th>
          {COLS.map(([k, label, cls]) => (
            <th key={k} className={'s ' + (cls || '')} onClick={() => onSort(k)}>{label}{sort.key === k ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
          ))}
          <th>Estado</th><th></th>
        </tr></thead>
        <tbody>
          {rows.map((p) => <Row key={p.id} p={p} checked={selected.has(p.id)} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)}
        </tbody>
      </table>
    </div>
  );
}
