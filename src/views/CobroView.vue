<template>
  <div class="page">
    <div class="top">
      <button class="back" @click="router.back()">←</button>
      <div class="title">Cobro · Mesa {{ table?.name }}</div>
      <button class="done" @click="finish">Pagar</button>
    </div>

    <div class="box">
      (Aquí meteremos la pantalla de cobro del PDF)
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDemoStore } from "../stores/demo";

const route = useRoute();
const router = useRouter();
const store = useDemoStore();

const tableId = route.params.tableId;
const table = computed(() => store.tableById(tableId));

function finish() {
  // de momento: cobrar = vaciar mesa
  store.payTable(tableId);
  router.push("/planos");
}
</script>

<style scoped>
.page{ min-height:100vh; background: transparent; padding: 14px; }
.top{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.back{ border:1px solid #eee; background:#fff; border-radius:12px; padding:10px 12px; }
.title{ font-weight: 900; }
.done{ border:0; background:#0d1b2a; color:#fff; border-radius:12px; padding:10px 14px; font-weight: 900; }
.box{ margin-top:14px; border:1px dashed #ddd; background:#fff; border-radius:16px; padding: 20px; opacity:.8; }
</style>
