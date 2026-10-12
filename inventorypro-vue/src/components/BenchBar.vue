<script setup>
defineProps({ total: Number, shown: Number });
defineEmits(['insert', 'clear']);
</script>

<template>
  <div class="bench">
    <strong>Benchmark</strong>
    <button v-for="n in [1000, 2000, 5000]" :key="n" @click="$emit('insert', n)">Insertar {{ n.toLocaleString() }}</button>
    <button class="dng" :disabled="total === 0" @click="$emit('clear')">Limpiar registros</button>
    <span class="sp" />
    <span>Filas en DOM: <b>{{ shown }}</b> / {{ total }}</span>
  </div>
</template>
