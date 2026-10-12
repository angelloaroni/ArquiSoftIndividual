<script setup>
import { money } from '../data.js';
defineProps({ metrics: Object });
</script>

<template>
  <div class="cards">
    <div class="card"><div class="l">SKUs</div><div class="v">{{ metrics.skus.toLocaleString() }}</div></div>
    <div class="card"><div class="l">Unidades totales</div><div class="v">{{ metrics.totalUnits.toLocaleString() }}</div></div>
    <div class="card"><div class="l">Stock crítico</div><div class="v crit">{{ metrics.criticalCount }}</div><small>{{ metrics.criticalUnits }} unidades en riesgo</small></div>
    <div class="card"><div class="l">Valorizado de almacén</div><div class="v">{{ money(metrics.value) }}</div></div>
    <div class="card alerts"><div class="l">Alertas de reabastecimiento</div>
      <ul><li v-for="p in metrics.topAlerts" :key="p.id">{{ p.sku }} · {{ p.name }} ({{ p.stock }}/{{ p.minStock }})</li></ul>
    </div>
  </div>
</template>
