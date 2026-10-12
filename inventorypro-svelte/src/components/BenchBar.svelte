<script>
  let { total, shown, onInsert, onClear } = $props();
</script>

<div class="bench">
  <strong>Benchmark</strong>
  {#each [1000, 2000, 5000] as n}
    <button onclick={() => onInsert(n)}>Insertar {n.toLocaleString()}</button>
  {/each}
  <button class="dng" disabled={total === 0} onclick={onClear}>Limpiar registros</button>
  <span class="sp"></span>
  <span>Filas en DOM: <b>{shown}</b> / {total}</span>
</div>
