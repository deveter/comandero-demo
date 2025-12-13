<template>
  <div class="overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="t">¿Cuántos comensales?</div>
      <input class="inp" type="number" min="1" v-model="n" />
      <div class="row">
        <button class="b" @click="$emit('close')">Cancelar</button>
        <button class="b ok" @click="$emit('confirm', Number(n) || 1)">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
const props = defineProps({ initial: { type: Number, default: 1 } });
defineEmits(["close","confirm"]);
const n = ref(props.initial || 1);
watch(() => props.initial, v => n.value = v || 1);
</script>

<style scoped>
.overlay{ position:fixed; inset:0; background: rgba(0,0,0,.35); display:grid; place-items:center; }
.modal{ width:min(360px, 92vw); background:#fff; border-radius:16px; padding:14px; }
.t{ font-weight:900; margin-bottom: 10px; }
.inp{ width:100%; border:1px solid #eee; border-radius:12px; padding:12px; font-size:16px; }
.row{ display:flex; gap:10px; margin-top: 12px; }
.b{ flex:1; border:1px solid #eee; background:#fff; border-radius:12px; padding:12px; font-weight:900; }
.ok{ background:#0d1b2a; color:#fff; border-color:#0d1b2a; }
</style>
