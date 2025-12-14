<template>
  <div class="toggle">
    <button class="opt" :class="{active: modelValue==='list'}" @click="$emit('update:modelValue','list')">Lista</button>
    <button class="opt" :class="{active: modelValue==='map'}" @click="$emit('update:modelValue','map')">Mapa</button>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, required: true } });
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.toggle{ display:flex; border:1px solid #eee; border-radius: 999px; overflow:hidden; }
.opt{ padding:8px 14px; border:0; background:#fff; font-weight:800; opacity:.7; }
.opt.active{ background:#ffd6d6; opacity:1;color:#ff5757 }
</style>
