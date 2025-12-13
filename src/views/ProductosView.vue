<template>
  <div class="page">
    <!-- TOP BAR (Planos | Mesa X | Enviar) -->
    <div class="top">
      <button class="back" @click="goPlanos">← Planos</button>

      <div class="mesaTitle">Mesa {{ tableName }}</div>

      <button class="send" :class="{ hot: hasDraft }" @click="send">
        Enviar
      </button>
    </div>

    <input class="search" placeholder="Buscar por nombre" v-model="q" />

    <!-- HEADER (‹ CATEGORÍA | TURNO) -->
    <div class="subHeader">
      <button class="catBack" @click="goCategorias">
        <span class="chev">‹</span>
        <span class="catText">{{ catName }}</span>
      </button>

      <select v-model="course" class="courseSelect">
        <option>Comanda</option>
        <option>Entrantes</option>
        <option>Primero</option>
        <option>Segundo</option>
        <option>Postre</option>
        <option>Bebida</option>
      </select>
    </div>

    <div class="list">
      <button
        v-for="p in filteredProducts"
        :key="p.id"
        class="prod"
        :class="{ pressed: pressedId === String(p.id) }"
        @click="add(p.id)"
      >
        <div class="pname">{{ p.name }}</div>
        <div class="price">{{ p.price.toFixed(2) }} €</div>
      </button>
    </div>

    <OrderSheet
      :tableId="tableId"
      @inc-pending="(idx) => store.incDraft(tableId, idx)"
      @dec-pending="(idx) => store.decDraft(tableId, idx)"
      @edit-diners="openDiners"
      @pay="goPay"
      @print="printBill"
    />

    <ConfirmLeaveModal
      v-if="confirmLeave"
      @cancel="confirmLeave=false"
      @leave="() => { confirmLeave=false; store.discardDraft(tableId); router.push('/planos'); }"
      @send="() => { confirmLeave=false; store.sendCart(tableId); router.push('/planos'); }"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDemoStore } from "../stores/demo";
import OrderSheet from "../components/OrderSheet.vue";
import ConfirmLeaveModal from "../components/ConfirmLeaveModal.vue";

const confirmLeave = ref(false);

const store = useDemoStore();
const route = useRoute();
const router = useRouter();

const tableId = route.params.tableId;
const catId = route.params.catId;

const draft = computed(() => store.draftFor(tableId));
const hasDraft = computed(() => draft.value.items.length > 0);

const tableName = computed(() => {
  const t = store.tableById(tableId);
  return t?.name || tableId;
});

const catName = computed(() => {
  const c = store.categories.find(x => x.id === catId);
  return c ? c.name : "Productos";
});

const q = ref("");
const pressedId = ref(null);

// selector turno (mismo estado global que en Categorías)
const course = computed({
  get: () => store.ui.course || "Comanda",
  set: (v) => { store.ui.course = v; store.persist?.(); }
});

const filteredProducts = computed(() => {
  const term = q.value.trim().toLowerCase();

  // Si no hay texto, mostramos SOLO los productos de la categoría actual
  if (!term) return store.productsByCat(catId);

  // Si hay texto, buscamos en TODOS los productos (todas las familias)
  return store.products.filter(p => p.name.toLowerCase().includes(term));
});

function add(pid) {
  pressedId.value = String(pid);
  store.addToCart(tableId, pid);
  setTimeout(() => (pressedId.value = null), 150);
}

function goPlanos() {
  router.push("/planos");
}

function goCategorias() {
  router.push(`/mesa/${tableId}/categorias`);
}

function send() {
  store.sendCart(tableId);
  router.push("/planos");
}

function openDiners() {
  // igual que ya lo tienes en tu proyecto
  diners.open = true;
  diners.tableId = tableId;
  diners.initial = 2;
  diners.afterSetGo = false;
}

function goPay() {
  router.push(`/mesa/${tableId}/cobro`);
}

function printBill() {
  store.requestBill(tableId); // mesa azul
  router.push("/planos");
}
</script>

<style scoped>
.page{ min-height:100vh; background:transparent; padding: 14px; padding-bottom: 110px; }

/* top bar */
.top{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.back{ border:1px solid #eee; background:#fff; border-radius:12px; padding:10px 12px;border-color:#163357;border-width: 3px;font-size: medium;font-weight: 800; }
.mesaTitle{ font-weight: 900; }
.send{ border:1px solid #eee; background:#dbdbdb; border-radius:12px; padding:20px 24px; font-weight: 900;font-size: larger;color:white}
.send.hot{ background:#ff5757; border-color:#ff5757; color:#fff; }

.search{ width:100%; margin-top: 12px; border:1px solid #eee; border-radius:12px; padding: 12px; }

/* subheader (‹ categoría | turno) */
.subHeader{
  margin-top: 10px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.catBack{
  display:flex;
  align-items:center;
  gap:6px;
  border:0;
  background:transparent;
  padding:0;
  cursor:pointer;
  font-weight: 900;
  color:#163357;
}

.chev{
  font-size: 18px;
  line-height: 1;
}

.catText{
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.courseSelect{
  border:1px solid #eee;
  background:#fff;
  border-radius:12px;
  padding:8px 10px;
  font-weight: 800;
  color:#163357;
}

/* list productos */
.list {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.prod{
  display:flex;
  justify-content:space-between;
  align-items:center;
  min-height: 64px;
  border:1px solid #eee;
  background:#fff;
  border-radius:12px;
  padding: 17px;
  transition: transform 120ms ease, box-shadow 100ms ease;
}

.prod.pressed {
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(0,0,0,.12);
}

.pname{ font-weight: 800;color:#163357 }
.price{ opacity:.7; }
</style>

