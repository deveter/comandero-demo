<template>
  <div class="page">
    <div class="top">
      <button class="back" @click="router.back()"><img class="icon-back" src="../assets/arrow.png" alt=""></button>
      <div class="title">Mapeo de impresoras</div>
      <div style="width:44px"></div>
    </div>

    <div class="card">
      <div class="cardTitle">Impresoras disponibles</div>

      <button class="row" v-for="it in items" :key="it.key" @click="open(it)">
        <div class="rowLeft">{{ it.label }}</div>
        <div class="rowRight">›</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const items = [
  { key: "ticket", label: "Ticket" },
  { key: "marchay", label: "Marcha y sigue" },
  { key: "precioLibre", label: "Artículo de precio libre" },
  { key: "barra", label: "Barra" },
  { key: "cocina", label: "Cocina" },
  { key: "default", label: "Por defecto" },
];

function open(it) {
  router.push({ name: "imp-config", params: { key: it.key } });
}
</script>

<style scoped>
.page{
  min-height:100vh;
  background:transparent;
  padding: 14px;
}

.top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.back{
  border:1px solid #eee;
  background:#fff;
  border-radius:12px;
  padding:10px 12px;  
  border-width: 3px;
  font-size: medium;
  font-weight: 800;
  width:44px;
}

.title{
  font-weight: 900;
}

.card{
  margin-top: 14px;
  background:#fff;
  border:1px solid #eee;
  border-radius:16px;
  padding: 12px;
}

.cardTitle{
  font-weight: 900;
  margin-bottom: 10px;
}

.row{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border:0;
  background:transparent;
  padding: 14px 8px;
  border-radius: 12px;
  cursor:pointer;
  font-weight: 900;
}

.row:hover{ background:#f6f6f6; }

.rowRight{
  opacity:.4;
  font-size: 18px;
  font-weight: 900;
}

.icon-back{
  max-width: 13px;
}
</style>
