<template>
  <div class="page">
    <!-- TOP -->
    <div class="topbar">
      <button class="x" @click="goBack">×</button>
      <div class="topTitle">Cobro de mesa {{ tableName }}</div>
      <div style="width:24px;"></div>
    </div>

    <!-- TOTAL -->
    <div class="card">
      <div class="row">
        <div class="label">Total a cobrar</div>
        <div class="value">{{ totalAll.toFixed(2) }} €</div>
      </div>

      <div class="row small">
        <div class="label">Total por comensal</div>
        <div class="value muted">{{ perDiner.toFixed(2) }} €</div>
      </div>

      <div v-if="discountPct > 0" class="row small">
        <div class="label">Descuento</div>
        <div class="value muted">{{ discountPct }}%</div>
      </div>
    </div>

    <!-- MÉTODO PAGO -->
    <div class="card">
      <div class="label2">Selecciona la forma de pago</div>
      <div class="pills">
        <button class="pill" :class="{ active: method==='cash' }" @click="method='cash'">Metálico</button>
        <button class="pill" :class="{ active: method==='card' }" @click="method='card'">Tarjeta</button>
      </div>
    </div>

    <!-- PENDIENTE / IMPORTE -->
    <div class="payRow">
      <div class="payBox">
        <div class="payLbl">Pendiente</div>
        <div class="payVal">{{ pending.toFixed(2) }} €</div>
      </div>

      <button class="arrowBtn" @click="fillAllPending" :disabled="pending <= 0">
        →
      </button>

      <div class="payBox">
        <div class="payLbl">Importe</div>
        <div class="payVal">{{ amountDisplay }} €</div>
      </div>
    </div>

    <div class="hintRow">
      <div class="hint">Ingresa el importe a cobrar</div>
      <div class="info">i</div>
    </div>

    <!-- KEYPAD -->
    <div class="keypad">
      <button class="k" v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" @click="addDigit(n)">{{ n }}</button>
      <button class="k ghost" @click="addComma">,</button>
      <button class="k" @click="addDigit(0)">0</button>
      <button class="k" @click="backspace">⌫</button>
    </div>

    <!-- PAYMENTS LIST -->
    <div class="card payments">
      <div class="label2">Pagos realizados:</div>

      <div v-if="payments.length === 0" class="empty">—</div>

      <div v-else class="payList">
        <div class="payLine" v-for="(p, i) in payments" :key="i">
          <div class="pmethod">{{ p.methodLabel }}</div>
          <div class="pamount">{{ p.amount.toFixed(2) }} €</div>
        </div>
      </div>
    </div>

    <!-- FOOTER BUTTONS -->
    <div class="footer">
      <button class="btnSecondary" :disabled="!canCharge" @click="charge(false)">
        Cobrar
      </button>
      <button class="btnPrimary" :disabled="!canCharge" @click="charge(true)">
        Cobrar+ticket
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDemoStore } from "../stores/demo";

const store = useDemoStore();
const route = useRoute();
const router = useRouter();

const tableId = route.params.tableId;

// --- datos de mesa / totales
const table = computed(() => store.tableById?.(tableId) || store.tables?.find?.(t => String(t.id)===String(tableId)) || null);
const tableName = computed(() => table.value?.name || tableId);

const diners = computed(() => table.value?.diners || 0);

// total = enviado + pendiente (como en OrderSheet)
const totalPending = computed(() => (store.totalDraft ? store.totalDraft(tableId) : 0));
const totalSent = computed(() => (store.totalOrder ? store.totalOrder(tableId) : 0));
const totalAll = computed(() => totalPending.value + totalSent.value);

// descuento (si tú no lo tienes, queda 0 y no aparece)
const discountPct = computed(() => {
  const d = table.value?.discountPct ?? store.tablesMeta?.[tableId]?.discountPct ?? 0;
  return Number(d) || 0;
});

const perDiner = computed(() => {
  if (!diners.value) return 0;
  return totalAll.value / diners.value;
});

// --- pagos realizados (persistimos en store.ui para que sobreviva refresco)
function ensurePaymentsBucket() {
  if (!store.ui) store.ui = {};
  if (!store.ui.payments) store.ui.payments = {};
  if (!store.ui.payments[tableId]) store.ui.payments[tableId] = [];
}
onMounted(() => ensurePaymentsBucket());

const payments = computed(() => {
  ensurePaymentsBucket();
  return store.ui.payments[tableId];
});

const paidTotal = computed(() => payments.value.reduce((acc, p) => acc + (Number(p.amount) || 0), 0));
const pending = computed(() => Math.max(0, totalAll.value - paidTotal.value));

// --- método pago
const method = ref("cash");

// --- importe a cobrar (string para poder escribir coma)
const amountStr = ref("");
const amount = computed(() => parseAmount(amountStr.value));
const amountDisplay = computed(() => {
  const n = amount.value;
  // si no hay nada tecleado y no se ha usado flecha, que se vea 0,00
  if (!amountStr.value) return "0,00";
  return n.toFixed(2).replace(".", ",");
});

const canCharge = computed(() => amount.value > 0 && pending.value > 0);

watch(pending, (p) => {
  // si ya no hay pendiente, limpiamos importe
  if (p <= 0) amountStr.value = "";
});

function parseAmount(str) {
  if (!str) return 0;
  const normalized = str.replace(",", ".").replace(/[^\d.]/g, "");
  const n = Number(normalized);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function addDigit(n) {
  // evita cosas raras tipo 0000
  if (amountStr.value === "0") amountStr.value = "";
  amountStr.value += String(n);
}

function addComma() {
  if (!amountStr.value) {
    amountStr.value = "0,";
    return;
  }
  if (!amountStr.value.includes(",")) amountStr.value += ",";
}

function backspace() {
  amountStr.value = amountStr.value.slice(0, -1);
}

function fillAllPending() {
  // “arrastrar” todo el pendiente al importe
  amountStr.value = pending.value.toFixed(2).replace(".", ",");
}

function goBack() {
  // volvemos a planos (como en tu mock con X)
  router.push("/planos");
}

function methodLabel(m) {
  return m === "card" ? "Tarjeta" : "Metálico";
}

function setTableRedIfNeeded() {
  // si queda pendiente -> rojo
  // intenta métodos del store si existen
  if (pending.value > 0) {
    if (store.setStatus) store.setStatus(tableId, "busy");
    else if (store.setTableStatus) store.setTableStatus(tableId, "busy");
    else if (table.value) table.value.status = "busy";
  }
}

function closeTableAsPaid() {
  // 1) limpia pagos
  ensurePaymentsBucket();
  store.ui.payments[tableId] = [];

  // 2) limpia draft y order (pendiente/enviado) + totales
  if (store.discardDraft) store.discardDraft(tableId);
  if (store.clearOrder) store.clearOrder(tableId);

  // fallbacks por si tu store guarda mapas
  if (store.drafts?.[tableId]) store.drafts[tableId] = { items: [] };
  if (store.orders?.[tableId]) store.orders[tableId] = { items: [] };

  // 3) deja mesa como nueva: verde + 0 comensales
  if (store.setDiners) store.setDiners(tableId, 0);
  if (store.setStatus) store.setStatus(tableId, "free");
  if (store.setTableStatus) store.setTableStatus(tableId, "free");

  // fallback si estás mutando directamente la mesa
  if (table.value) {
    table.value.status = "free";
    table.value.diners = 0;
  }

  // opcional: si tienes estado "bill requested" (azul), lo limpias aquí
  if (store.clearBillRequest) store.clearBillRequest(tableId);
  if (table.value && "billRequested" in table.value) table.value.billRequested = false;

  store.persist?.();
}


function charge(_withTicket) {
  if (!canCharge.value) return;

  const payNow = Math.min(amount.value, pending.value);

  ensurePaymentsBucket();
  store.ui.payments[tableId].push({
    amount: payNow,
    method: method.value,
    methodLabel: methodLabel(method.value),
    ts: Date.now(),
  });
  store.persist?.();

  // reset input
  amountStr.value = "";

  const remaining = Math.max(0, pending.value - payNow);

  // ✅ SI QUEDA PENDIENTE: mesa sigue roja pero VOLVEMOS A PLANOS
  if (remaining > 0.0001) {
    setTableRedIfNeeded();
    router.push("/planos");
    return;
  }

  // ✅ SI YA ESTÁ TODO PAGADO: cerrar mesa (verde, diners 0, total 0, limpiar todo) y volver a planos
  closeTableAsPaid();
  if (store.resetTable) store.resetTable(tableId);
    else closeTableAsPaid(); // fallback por si aún no lo has metido

    router.push("/planos");
  }

</script>

<style scoped>
.page{
  min-height:100vh;
  background: transparent;
  padding: 14px;
  padding-bottom: 96px;
}

.topbar{
  display:flex;
  align-items:center;
  gap:10px;
}

.x{
  border:0;
  background:transparent;
  font-size:20px;
  font-weight:900;
  cursor:pointer;
}

.topTitle{
  font-weight:900;
  font-size:14px;
}

.card{
  margin-top: 12px;
  background:#fff;
  border:1px solid #eee;
  border-radius: 14px;
  padding: 12px;
}

.row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
}

.row + .row{ margin-top: 8px; }

.label{
  font-weight:900;
  font-size:18px;
  opacity:.85;
}

.value{
  font-weight:900;
  font-size:18px;
}

.small .label{ opacity:.55; font-weight:800; }
.small .value{ font-weight:800; }
.muted{ opacity:.6; }

.label2{
  font-weight:900;
  font-size:18px;
  opacity:.8;
  margin-bottom: 8px;
}

.pills{
  display:flex;
  gap:8px;
  flex-wrap: wrap;
}

.pill{
  border:1px solid #e6e6e6;
  background:#fff;
  border-radius: 999px;
  padding: 8px 10px;
  font-weight:900;
  font-size: 18px;
  cursor:pointer;
}

.pill.active{
  border-color:#163357;
  background-color:#163357 ;
  color:white;
  box-shadow: 0 0 0 2px rgba(22,51,87,.08);
}

.payRow{
  margin-top: 12px;
  display:flex;
  align-items:center;
  gap:10px;
}

.payBox{
  flex:1;
  background:#fff;
  border:1px solid #eee;
  border-radius:14px;
  padding: 10px 12px;
}

.payLbl{
  font-weight:900;
  font-size:18px;
  opacity:.7;
}

.payVal{
  margin-top: 4px;
  font-weight:900;
  font-size:18px;
}

.arrowBtn{
  width:46px;
  height:46px;
  border-radius: 999px;
  border: 1px solid #ffd1d1;
  background: #ffe6e6;
  color:#ff3b30;
  font-weight:900;
  cursor:pointer;
}

.arrowBtn:disabled{
  opacity:.35;
  cursor:not-allowed;
}

.hintRow{
  margin-top: 10px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  opacity:.75;
  font-size:12px;
}

.info{
  width:18px;
  height:18px;
  border-radius: 999px;
  border:1px solid #ddd;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
  font-size:11px;
}

.keypad{
  margin-top: 10px;
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.k{
  height:44px;
  border-radius: 12px;
  border:0;
  background:#efefef;
  font-weight:900;
  font-size:18px;
  cursor:pointer;
}

.k.ghost{
  opacity:.7;
}

.payments{
  margin-top: 12px;
}

.payList{
  margin-top: 6px;
  display:grid;
  gap: 6px;
}

.payLine{
  display:flex;
  justify-content:space-between;
  font-weight:900;
  font-size:12px;
  opacity:.85;
}

.empty{
  opacity:.5;
  font-weight:800;
  padding: 8px 0;
}

.footer{
  position: fixed;
  left:0; right:0; bottom:0;
  background:#fff;
  border-top:1px solid #eee;
  padding: 12px 14px 14px;
  display:flex;
  gap:10px;
}

.btnSecondary{
  flex:1;
  border: 1px solid #ddd;
  background:#fff;
  border-radius: 12px;
  padding: 14px;
  font-weight:900;
  font-size:20px;
}

.btnPrimary{
  flex:1;
  border:0;
  background:#ff3b30;
  color:#fff;
  border-radius: 12px;
  padding: 14px;
  font-weight:900;
  font-size:20px
}

.btnSecondary:disabled,
.btnPrimary:disabled{
  opacity:.35;
  cursor:not-allowed;
}
</style>
