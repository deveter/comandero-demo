<template>
  <div class="tabs">
    <button
      v-for="z in zones"
      :key="z.id"
      class="tab"
      :class="{ active: z.id === modelValue }"
      @click="$emit('update:modelValue', z.id)"
    >
      {{ z.name }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  zones: { type: Array, default: () => [] },
  modelValue: { type: String, required: true },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.tabs{ display:flex; gap:8px; overflow:auto; padding-bottom: 6px; }
.tab{
  border:1px solid #eee; background:#f4f4f4;
  padding:8px 12px; border-radius: 999px; white-space: nowrap;
  font-weight: 800; opacity:.85;
}
.tab.active{
  background:#0d1b2a; color:#fff; border-color:#0d1b2a; opacity:1;
}
</style>
