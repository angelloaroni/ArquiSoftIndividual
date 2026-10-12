<script>
  import { CATEGORIES, emptyDraft, toDraft, validateProduct } from '../data.js';

  let { product, products, onSave, onCancel } = $props();
  let draft = $state(product ? toDraft(product) : emptyDraft());
  // bind:value en type=number entrega números (o null si está vacío); validateProduct espera strings
  const asStrings = () => ({ ...draft, stock: String(draft.stock ?? ''), minStock: String(draft.minStock ?? ''), price: String(draft.price ?? '') });
  const errors = $derived(validateProduct(asStrings(), products, product?.id ?? null));
  const valid = $derived(Object.keys(errors).length === 0);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={onCancel}>
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <h2>{product ? 'Editar producto' : 'Nuevo producto'}</h2>
    <div class="field"><label>SKU</label><input bind:value={draft.sku} class:bad={errors.sku} /><span class="err">{errors.sku ?? ''}</span></div>
    <div class="field"><label>Nombre</label><input bind:value={draft.name} class:bad={errors.name} /><span class="err">{errors.name ?? ''}</span></div>
    <div class="field"><label>Categoría</label>
      <select bind:value={draft.category}>{#each CATEGORIES as c}<option>{c}</option>{/each}</select>
      <span class="err">{errors.category ?? ''}</span>
    </div>
    <div class="row2">
      <div class="field"><label>Stock</label><input type="number" bind:value={draft.stock} class:bad={errors.stock} /><span class="err">{errors.stock ?? ''}</span></div>
      <div class="field"><label>Stock mínimo</label><input type="number" bind:value={draft.minStock} class:bad={errors.minStock} /><span class="err">{errors.minStock ?? ''}</span></div>
      <div class="field"><label>Precio (S/)</label><input type="number" step="0.01" bind:value={draft.price} class:bad={errors.price} /><span class="err">{errors.price ?? ''}</span></div>
    </div>
    <div class="actions">
      <button onclick={onCancel}>Cancelar</button>
      <button class="pri" disabled={!valid} onclick={() => onSave(asStrings())}>Guardar</button>
    </div>
  </div>
</div>
