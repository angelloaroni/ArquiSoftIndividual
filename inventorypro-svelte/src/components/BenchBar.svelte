<script>
  let { bench, total, shown, onInsert } = $props();
  const fmt = (v) => (v == null ? '—' : v.toFixed(1) + ' ms');
</script>

<div class="bench">
  <strong>Benchmark</strong>
  {#each [1000, 2000, 5000] as n}
    <button onclick={() => onInsert(n)}>Insertar {n.toLocaleString()}</button>
  {/each}
  <span class="sp"></span>
  <span>Último render: <b>{fmt(bench.render)}</b></span>
  <span>Último filtro: <b>{fmt(bench.filter)}</b></span>
  <span>Filas en DOM: <b>{shown}</b> / {total}</span>
</div>
