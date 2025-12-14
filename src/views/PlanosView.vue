<template>
  <div class="page">
    <div class="top">
      <div>
        <h2>Planos</h2>
        <div class="me"><span ><img class="icon-card" src="../assets/user.png"></span> {{ store.session.user?.name }} {{ store.session.user?.surname }}</div>
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
  <div class="cardContent">
    <div class="circle" :class="t.status">{{ t.name }}</div>

    <div class="info">

  <!-- Comensales -->
  <div class="info-row">
    <span ><img class="icon-card" src="../assets/user.png"></span>
    <span class="text-card">{{ store.tableById(t.id)?.diners || 0 }}</span>
  </div>

  <!-- Importe -->
  <div class="info-row">
    <span class="text-card">{{ store.totalOrder(t.id).toFixed(2) }} €</span>
  </div>

</div>


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
      :tableName="diners.tableName"
      :initial="diners.initial"
      @close="diners.open=false"
      @accept="onAcceptDiners"      
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
    diners.initial = 0;
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

function onAcceptDiners(n) {
  store.setDiners(diners.tableId, n);
  diners.open = false;

  // ir directo a la mesa (categorías)
  router.push(`/mesa/${diners.tableId}/categorias`);
}
</script>

<style scoped>
h2{
  margin:0px !important;
}

.page{
  padding: 16px;
  min-height:100vh;
  background:transparent;
}

.top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
}

.me{
  opacity:.7;
  margin-top: 20px;
  margin-bottom: 20px;
}

.grid{
  margin-top: 14px;
  display:grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

/* BOTÓN CUADRADO INFALIBLE */
.card{
  width: 100%;
  border:1px solid #eee;
  background:#fff;
  border-radius:16px;

  padding: 0;              /* el padding va dentro */
  position: relative;
  overflow: hidden;

  touch-action: manipulation;
}

/* Esto fuerza alto = ancho */
.card::before{
  content:"";
  display:block;
  padding-top:100%;
}

/* Contenido “encima” del cuadrado */
.cardContent{
  position:absolute;
  inset:0;
  padding: 12px;

  display:flex;
  flex-direction:column;
  justify-content: space-between;
  align-items:center;
}

/*ICONOS DEL CARD*/
.icon-card{
  max-width: 13px;
}

.text-card{
  font-weight:600;
}

/* CÍRCULO */
.circle{
  width: 44px;
  height:44px;
  border-radius:999px;
  display:grid;
  place-items:center;
  color:#fff;
  font-weight: 900;
}

.circle.free{ background:#2ecc71; }
.circle.busy{ background:#e74c3c; }
.circle.bill_requested{ background:#3498db; }

/* INFO ABAJO */
.info{
  width:100%;
  display:flex;
  flex-direction: column;    /* ⬆️ Pila vertical */
  justify-content: center;
  align-items: center;       /* centra texto */
  opacity:.85;
  font-weight:800;
  gap: 4px;                  /* espacio entre líneas */
}

.info-row{
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.info-row .icon {
  width: 14px;
  height: 14px;
  display: inline-block;
}

/* RELOJ */
.icon-clock {
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>') no-repeat center;
  background-color: currentColor;
}
</style>
