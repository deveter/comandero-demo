<template>
  <div class="page">
    <div class="top">
      <div>
        <h2>Planos</h2>
        <div class="me">👤 {{ store.session.user?.name }} {{ store.session.user?.surname }}</div>
      </div>
      <ViewToggle v-model="store.ui.viewMode" />
    </div>

    <ZoneTabs v-model="store.ui.activeZoneId" :zones="store.zones" />

    <div v-if="store.ui.viewMode==='map'" class="mapPlaceholder">
      (Mapa lo hacemos más adelante)
    </div>

    <div v-else class="grid">
      <button
        v-for="t in tablesInZone"
        :key="t.id"
        class="card"
        @click="onTapTable(t)"
        @pointerdown="startPress(t)"
        @pointerup="cancelPress"
        @pointerleave="cancelPress"
      >
        <div class="circle" :class="t.status">{{ t.name }}</div>

        <div class="info">
          <div class="diners">👥 {{ t.diners || 0 }}</div>
          <div class="amt">{{ store.totalOrder(t.id).toFixed(2) }} €</div>
        </div>
      </button>
    </div>

    <TableActionsSheet
      v-if="sheet.open"
      :tableName="sheet.table?.name"
      @close="sheet.open=false"
      @edit-diners="openDiners(sheet.table)"
      @discount="todo('Descuento (pendiente)')"
      @print="todo('Imprimir cuenta (pendiente)')"
      @pay="goPay(sheet.table)"
    />

    <DinersModal
      v-if="diners.open"
      :initial="diners.initial"
      @close="diners.open=false"
      @confirm="confirmDiners"
    />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useDemoStore } from "../stores/demo";
import ZoneTabs from "../components/ZoneTabs.vue";
import ViewToggle from "../components/ViewToggle.vue";
import TableActionsSheet from "../components/TableActionsSheet.vue";
import DinersModal from "../components/DinersModal.vue";

const store = useDemoStore();
const router = useRouter();

const tablesInZone = computed(() =>
  store.tables.filter(t => t.zoneId === store.ui.activeZoneId)
);

const sheet = reactive({ open:false, table:null });
const diners = reactive({ open:false, tableId:null, initial:1, afterSetGo:false });

let pressTimer = null;

function startPress(t){
  cancelPress();
  pressTimer = setTimeout(() => {
    sheet.open = true;
    sheet.table = t;
  }, 450);
}
function cancelPress(){
  if (pressTimer) clearTimeout(pressTimer);
  pressTimer = null;
}

function onTapTable(t){
  // si era long-press, no navegamos
  if (sheet.open) return;

  // Si mesa libre y sin comensales -> pedir comensales antes de entrar
  if (t.status === "free" && (!t.diners || t.diners === 0)) {
    diners.open = true;
    diners.tableId = t.id;
    diners.initial = 2;
    diners.afterSetGo = true;
    return;
  }

  router.push(`/mesa/${t.id}/categorias`);
}

function openDiners(t){
  sheet.open = false;
  diners.open = true;
  diners.tableId = t.id;
  diners.initial = t.diners || 2;
  diners.afterSetGo = false;
}

function confirmDiners(n){
  store.setDiners(diners.tableId, n);
  const go = diners.afterSetGo;
  const tableId = diners.tableId;
  diners.open = false;
  diners.afterSetGo = false;
  if (go) router.push(`/mesa/${tableId}/categorias`);
}

function goPay(t){
  sheet.open = false;
  // de momento: si está azul, cobra directo o luego lo llevamos a CobroView
  store.payTable(t.id);
}

function todo(msg){ sheet.open=false; alert(msg); }
</script>

<style scoped>
.page{ padding: 16px; min-height:100vh; background:transparent; }
.top{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.me{ opacity:.7; margin-top: 4px; }

.grid{
  margin-top: 14px;
  display:grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.card{
  border:1px solid #eee; background:#fff; border-radius:16px;
  padding: 12px;
  display:flex; flex-direction:column; align-items:center; gap: 10px;
}

.circle{
  width: 44px; height:44px; border-radius:999px;
  display:grid; place-items:center;
  color:#fff; font-weight: 900;
}
.circle.free{ background:#2ecc71; }
.circle.busy{ background:#e74c3c; }
.circle.bill_requested{ background:#3498db; }

.info{ width:100%; display:flex; justify-content:space-between; opacity:.85; font-weight:800; }
.mapPlaceholder{ margin-top: 14px; border:1px dashed #ddd; border-radius:16px; padding: 30px; opacity:.7; text-align:center; }
</style>


