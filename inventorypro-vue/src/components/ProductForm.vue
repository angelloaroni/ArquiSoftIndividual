<script setup>
import { computed, reactive } from 'vue';
import { CATEGORIES, emptyDraft, toDraft, validateProduct } from '../data.js';

const props = defineProps({ product: Object, products: Array });
const emit = defineEmits(['save', 'cancel']);

const draft = reactive(props.product ? toDraft(props.product) : emptyDraft());
// v-model sobre type=number entrega números; validateProduct espera strings
const asStrings = () => ({ ...draft, stock: String(draft.stock), minStock: String(draft.minStock), price: String(draft.price) });
const errors = computed(() => validateProduct(asStrings(), props.products, props.product?.id ?? null));
const valid = computed(() => Object.keys(errors.value).length === 0);
</script>

<template>
  <div class="backdrop" @click="emit('cancel')">
    <div class="modal" @click.stop>
      <h2>{{ product ? 'Editar producto' : 'Nuevo producto' }}</h2>
      <div class="field"><label>SKU</label><input v-model="draft.sku" :class="{ bad: errors.sku }" /><span class="err">{{ errors.sku }}</span></div>
      <div class="field"><label>Nombre</label><input v-model="draft.name" :class="{ bad: errors.name }" /><span class="err">{{ errors.name }}</span></div>
      <div class="field"><label>Categoría</label>
        <select v-model="draft.category"><option v-for="c in CATEGORIES" :key="c">{{ c }}</option></select>
        <span class="err">{{ errors.category }}</span>
      </div>
      <div class="row2">
        <div class="field"><label>Stock</label><input type="number" v-model="draft.stock" :class="{ bad: errors.stock }" /><span class="err">{{ errors.stock }}</span></div>
        <div class="field"><label>Stock mínimo</label><input type="number" v-model="draft.minStock" :class="{ bad: errors.minStock }" /><span class="err">{{ errors.minStock }}</span></div>
        <div class="field"><label>Precio (S/)</label><input type="number" step="0.01" v-model="draft.price" :class="{ bad: errors.price }" /><span class="err">{{ errors.price }}</span></div>
      </div>
      <div class="actions">
        <button @click="emit('cancel')">Cancelar</button>
        <button class="pri" :disabled="!valid" @click="emit('save', asStrings())">Guardar</button>
      </div>
    </div>
  </div>
</template>
