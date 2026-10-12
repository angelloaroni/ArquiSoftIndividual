<script>
  import { STATUS_LABEL, money, stockStatus } from '../data.js';

  let { rows, selected, sort, onSort, onToggle, onToggleAll, onEdit, onDelete } = $props();
  const COLS = [['sku', 'SKU'], ['name', 'Producto'], ['category', 'Categoría'], ['stock', 'Stock', 'n'], ['minStock', 'Mín.', 'n'], ['price', 'Precio', 'n']];
  const allOn = $derived(rows.length > 0 && rows.every((r) => selected.has(r.id)));
</script>

<div class="tablewrap" style="max-height: 520px">
  <table>
    <thead>
      <tr>
        <th><input type="checkbox" checked={allOn} onchange={onToggleAll} /></th>
        {#each COLS as [k, label, cls]}
          <th class={'s ' + (cls ?? '')} onclick={() => onSort(k)}>{label}{sort.key === k ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
        {/each}
        <th>Estado</th><th></th>
      </tr>
    </thead>
    <tbody>
      {#each rows as p (p.id)}
        {@const st = stockStatus(p)}
        <tr class:sel={selected.has(p.id)}>
          <td><input type="checkbox" checked={selected.has(p.id)} onchange={() => onToggle(p.id)} /></td>
          <td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td>
          <td class="n">{p.stock}</td><td class="n">{p.minStock}</td><td class="n">{money(p.price)}</td>
          <td><span class={'badge ' + st}>{STATUS_LABEL[st]}</span></td>
          <td class="act"><button onclick={() => onEdit(p)}>Editar</button><button class="dng" onclick={() => onDelete(p.id)}>✕</button></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
