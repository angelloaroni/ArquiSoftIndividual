import { useState } from 'react';
import { CATEGORIES, emptyDraft, toDraft, validateProduct } from '../data.js';

// Definido fuera del componente: si se declarara dentro, React lo remontaría en cada tecla y se perdería el foco.
const Field = ({ label, error, children }) => (
  <div className="field"><label>{label}</label>{children}<span className="err">{error}</span></div>
);

export default function ProductForm({ product, products, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => (product ? toDraft(product) : emptyDraft()));
  const errors = validateProduct(draft, products, product?.id ?? null);
  const valid = Object.keys(errors).length === 0;
  const bind = (k) => ({ value: draft[k], className: errors[k] ? 'bad' : '', onChange: (e) => setDraft({ ...draft, [k]: e.target.value }) });

  return (
    <div className="backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{product ? 'Editar producto' : 'Nuevo producto'}</h2>
        <Field error={errors.sku} label="SKU"><input {...bind('sku')} /></Field>
        <Field error={errors.name} label="Nombre"><input {...bind('name')} /></Field>
        <Field error={errors.category} label="Categoría">
          <select {...bind('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <div className="row2">
          <Field error={errors.stock} label="Stock"><input type="number" {...bind('stock')} /></Field>
          <Field error={errors.minStock} label="Stock mínimo"><input type="number" {...bind('minStock')} /></Field>
          <Field error={errors.price} label="Precio (S/)"><input type="number" step="0.01" {...bind('price')} /></Field>
        </div>
        <div className="actions">
          <button onClick={onCancel}>Cancelar</button>
          <button className="pri" disabled={!valid} onClick={() => onSave(draft)}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
