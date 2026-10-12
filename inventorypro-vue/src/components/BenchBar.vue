<script setup>
defineProps({ bench: Object, total: Number, shown: Number });
defineEmits(['insert']);
const fmt = (v) => (v == null ? '—' : v.toFixed(1) + ' ms');
</script>

<template>
  <div class="bench">
    <strong>Benchmark</strong>
    <button v-for="n in [1000, 2000, 5000]" :key="n" @click="$emit('insert', n)">Insertar {{ n.toLocaleString() }}</button>
    <span class="sp" />
    <span>Último render: <b>{{ fmt(bench.render) }}</b></span>
    <span>Último filtro: <b>{{ fmt(bench.filter) }}</b></span>
    <span>Filas en DOM: <b>{{ shown }}</b> / {{ total }}</span>
  </div>
</template>
