<script setup>
import { computed } from 'vue';
import { STATUS_LABEL, money, stockStatus } from '../data.js';

const props = defineProps({ rows: Array, selected: Set, sort: Object });
defineEmits(['sort', 'toggle', 'toggleAll', 'edit', 'delete']);

const COLS = [['sku', 'SKU'], ['name', 'Producto'], ['category', 'Categoría'], ['stock', 'Stock', 'n'], ['minStock', 'Mín.', 'n'], ['price', 'Precio', 'n']];
const allOn = computed(() => props.rows.length > 0 && props.rows.every((r) => props.selected.has(r.id)));
</script>

<template>
  <div class="tablewrap" style="max-height: 520px">
    <table>
      <thead>
        <tr>
          <th><input type="checkbox" :checked="allOn" @change="$emit('toggleAll')" /></th>
          <th v-for="[k, label, cls] in COLS" :key="k" :class="['s', cls]" @click="$emit('sort', k)">
            {{ label }}{{ sort.key === k ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '' }}
          </th>
          <th>Estado</th><th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in rows" :key="p.id" :class="{ sel: selected.has(p.id) }">
          <td><input type="checkbox" :checked="selected.has(p.id)" @change="$emit('toggle', p.id)" /></td>
          <td>{{ p.sku }}</td><td>{{ p.name }}</td><td>{{ p.category }}</td>
          <td class="n">{{ p.stock }}</td><td class="n">{{ p.minStock }}</td><td class="n">{{ money(p.price) }}</td>
          <td><span :class="['badge', stockStatus(p)]">{{ STATUS_LABEL[stockStatus(p)] }}</span></td>
          <td class="act"><button @click="$emit('edit', p)">Editar</button><button class="dng" @click="$emit('delete', p.id)">✕</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
