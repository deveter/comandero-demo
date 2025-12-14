<template>
  <div
    class="sheet"
    :class="{ animating: isAnimating }"
    :style="{ transform: `translateY(${translateY}px)` }"
  >
    <!-- handle / minimizado -->
    <div
      class="handle"
      @touchstart.prevent="onStart"
      @touchmove.prevent="onMove"
      @touchend.prevent="onEnd"
      @click="toggle"
    >
      <div class="bar"></div>

      <div class="miniRow">
        <div class="miniTitle">Comanda</div>
        <div class="miniTotal">{{ totalAll.toFixed(2) }} €</div>
      </div>
      <div class="miniSub">
        {{ pendingItems.length }} pendientes · {{ sentItems.length }} enviados
      </div>
    </div>

    <!-- expandido -->
    <div class="content">
      <!-- HEADER fijo dentro del sheet -->
      <div class="sheetHeader">
        <div class="headRow">
          <div class="headLeft">
            <div class="headTitle">Comanda</div>
            <div class="headTotals">
              <span class="big">{{ totalAll.toFixed(2) }} €</span>
              <span class="sep">|</span>
              <span class="per2">{{ perDinerText }}</span>
            </div>
            <div class="tarifa">Tarifa: Precio base</div>
          </div>

          <button class="dinersBox" @click="$emit('edit-diners')">
            <div class="dinersNum">{{ diners || 0 }}</div>
            <div class="dinersLbl">👥</div>
          </button>
        </div>

        <!-- 3 botones -->
        <div class="actions">
          <button class="aBtn" @click="$emit('apply-tariff')">
            <span class="ico">🏷️</span>
            <span>Aplicar<br/>tarifa</span>
          </button>

          <button class="aBtn" @click="$emit('apply-discount')">
            <span class="ico">％</span>
            <span>Aplicar<br/>descuento</span>
          </button>

          <button class="aBtn" @click="$emit('march-continue')">
            <span class="ico">▶️</span>
            <span>Marcha<br/>y sigue</span>
          </button>
        </div>
      </div>

      <!-- SOLO esto scrollea -->
      <div class="sheetScroll">
        <!-- Pendiente -->
        <div class="section">
          <div class="secTitle">Pendiente de enviar</div>
          <div v-if="pendingItems.length === 0" class="empty">No hay productos pendientes.</div>

          <div v-else class="box">
            <div class="line" v-for="(it, idx) in pendingItems" :key="'p'+idx">
              <div class="lName">{{ it.qty }} x {{ it.name }}</div>
              <div class="lRight">
                <div class="lPrice">{{ (it.qty * it.unit).toFixed(2) }} €</div>
                <div class="qtyBtns">
                  <button class="q" @click="$emit('dec-pending', idx)">–</button>
                  <button class="q" @click="$emit('inc-pending', idx)">+</button>
                </div>
              </div>
            </div>

            <div class="totalRow">
              <div class="bold">Total</div>
              <div class="bold">{{ totalPending.toFixed(2) }} €</div>
            </div>
          </div>
        </div>

        <!-- Enviado -->
        <div class="section sent">
          <div class="secTitle">Enviado</div>

          <div v-if="sentItems.length === 0" class="empty">No hay productos enviados todavía.</div>

          <div v-else class="box soft">
            <div class="line" v-for="(it, idx) in sentItems" :key="'s'+idx">
              <div class="lName">{{ it.qty }} x {{ it.name }}</div>
              <div class="lPrice">{{ (it.qty * it.unit).toFixed(2) }} €</div>
            </div>
          </div>

          <!-- espacio para que el scroll no quede debajo de botones fijos -->
          <div class="scrollSpacer"></div>
        </div>
      </div>

      <!-- FOOTER fijo -->
      <div class="sheetFooter">
        <button class="payBtn" @click="$emit('pay')">Cobrar</button>
        <button class="printBtn" @click="$emit('print')">Imprimir cuenta</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useDemoStore } from "../stores/demo";

const props = defineProps({
  tableId: { type: String, required: true },
});
defineEmits([
  "inc-pending",
  "dec-pending",
  "edit-diners",
  "apply-tariff",
  "apply-discount",
  "march-continue",
  "pay",
  "print",
]);

const store = useDemoStore();

const diners = computed(() => store.tableById(props.tableId)?.diners || 0);
const pending = computed(() => store.draftFor(props.tableId));
const order = computed(() => store.orderFor(props.tableId));

const pendingItems = computed(() => pending.value.items || []);
const sentItems = computed(() => order.value.items || []);

const totalPending = computed(() => store.totalDraft(props.tableId));
const totalSent = computed(() => store.totalOrder(props.tableId));
const totalAll = computed(() => totalPending.value + totalSent.value);

const perDinerText = computed(() => {
  const d = diners.value;
  if (!d) return "0,00 €/comensal";
  return `${(totalAll.value / d).toFixed(2)} €/comensal`;
});

const expanded = ref(false);
const sheetHeight = ref(Math.round(window.innerHeight * 0.78));
const collapsedHeight = 92;

const maxTranslate = computed(() => sheetHeight.value - collapsedHeight);
const translateY = ref(0);

const SNAP_PX = 26;
const isAnimating = ref(false);

onMounted(() => {
  sheetHeight.value = Math.round(window.innerHeight * 0.78);
  translateY.value = expanded.value ? 0 : maxTranslate.value;

  window.addEventListener("resize", () => {
    sheetHeight.value = Math.round(window.innerHeight * 0.78);
    translateY.value = expanded.value ? 0 : (sheetHeight.value - collapsedHeight);
  });
});

function snapTo(open) {
  expanded.value = open;
  isAnimating.value = true;
  translateY.value = open ? 0 : maxTranslate.value;
  setTimeout(() => (isAnimating.value = false), 170);
}

function toggle() {
  snapTo(!expanded.value);
}

let startY = 0;
let startTranslate = 0;
let dragged = false;

function onStart(e) {
  startY = e.touches[0].clientY;
  startTranslate = translateY.value;
  dragged = false;
}

function onMove(e) {
  const y = e.touches[0].clientY;
  const delta = y - startY;

  if (Math.abs(delta) > 8) dragged = true;

  isAnimating.value = false;
  const next = Math.min(maxTranslate.value, Math.max(0, startTranslate + delta));
  translateY.value = next;
}

function onEnd() {
  if (!dragged) return;
  const moved = translateY.value - startTranslate;

  if (Math.abs(moved) >= SNAP_PX) {
    if (moved < 0) snapTo(true);
    else snapTo(false);
    return;
  }
  snapTo(expanded.value);
}
</script>

<style scoped>
.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 78vh;
  background: #fff;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  border: 1px solid #eee;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, .08);
  will-change: transform;
  touch-action: pan-y;
  overscroll-behavior: contain;
}

.sheet.animating {
  transition: transform 170ms ease;
}

.handle {
  padding: 10px 14px 12px;
  border-bottom: 1px solid #f2f2f2;
}

.bar {
  width: 44px;
  height: 5px;
  border-radius: 6px;
  background: #e7e7e7;
  margin: 0 auto 8px;
}

.miniRow {
  display: flex;
  justify-content: space-between;
  font-weight: 900;
}

.miniSub {
  margin-top: 2px;
  opacity: .65;
  font-size: 12px;
}

.content {
  display: flex;
  flex-direction: column;
  height: calc(78vh - 78px);
}

.sheetHeader {
  padding: 12px 14px 10px;
  border-bottom: 1px solid #f2f2f2;
}

.sheetScroll {
  flex: 1;
  overflow: auto;
  padding: 12px 14px;
  touch-action: auto;
  -webkit-overflow-scrolling: touch;
}

.sheetFooter {
  padding: 12px 14px 14px;
  border-top: 1px solid #f2f2f2;
  background: #fff;
}

.scrollSpacer {
  height: 90px;
}

.tarifa {
  margin-top: 4px;
  font-size: 12px;
  opacity: .55;
  font-weight: 700;
}

.headRow {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.headTitle {
  font-weight: 900;
}

.headTotals {
  margin-top: 4px;
  font-size: 12px;
  opacity: .75;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.big {
  font-weight: 900;
  opacity: 1;
}

.sep {
  opacity: .35;
}

.per2 {
  opacity: .65;
}

.dinersBox {
  border: 1px solid #eee;
  background: #fff;
  border-radius: 12px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dinersNum {
  font-weight: 900;
  font-size: 16px;
}

.dinersLbl {
  opacity: .7;
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.aBtn {
  flex: 1;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 14px;
  padding: 10px 8px;
  font-weight: 900;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ico {
  font-size: 18px;
}

.section {
  margin-top: 14px;
}

.secTitle {
  font-weight: 900;
  font-size: 12px;
  opacity: .65;
  margin-bottom: 8px;
}

.box {
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  padding: 13px;
}

.box.soft {
  background: #f6f6f6;
  border-color: #ededed;
}

.line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f3f3;
}

.box.soft .line {
  border-bottom-color: #e9e9e9;
}

.line:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.lName {
  font-weight: 800;
  font-size: 15px;
}

.lRight {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.lPrice {
  font-weight: 900;
  font-size: 12px;
  opacity: .8;
}

.qtyBtns {
  display: flex;
  gap: 8px;
}

.q {
  width: 30px;
  height: 30px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fff;
  font-size: 18px;
  touch-action: manipulation;
}

.totalRow {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  opacity: .8;
}

.bold {
  font-weight: 900;
  opacity: 1;
  font-size: 12px;
}

.empty {
  padding: 10px;
  opacity: .6;
  font-size: 12px;
}

.payBtn {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 14px;
  background: #163357;
  color: #fff;
  font-weight: 900;
  font-size: larger;
  touch-action: manipulation;
}

.printBtn {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 14px;
  background: #fff;
  font-weight: 900;
  opacity: .9;
  font-size: larger;
  touch-action: manipulation;
}
</style>
