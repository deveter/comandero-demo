<template>
  <div class="page">
    <div class="top">
      <button class="back" @click="goBack">← Categorías</button>
      <div class="title">{{ catName }}</div>
      <button class="send" :class="{ hot: hasDraft }" @click="send">
        Enviar
      </button>
    </div>

    <input class="search" placeholder="Buscar por nombre" v-model="q" />

    <div class="list">
      <button
        v-for="p in filteredProducts"
        :key="p.id"
        class="prod"
        :class="{ pressed: pressedId === p.id }"
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
const hasDraft = computed(() => draft.value.items.length > 0);


const store = useDemoStore();
const route = useRoute();
const router = useRouter();

const tableId = route.params.tableId;
const catId = route.params.catId;

const draft = computed(() => store.draftFor(tableId));

const catName = computed(() => {
  const c = store.categories.find(x => x.id === catId);
  return c ? c.name : "Productos";
});

const q = ref("");
const pressedId = ref(null);

const filteredProducts = computed(() => {
  const term = q.value.trim().toLowerCase();

  // Si no hay texto, mostramos SOLO los productos de la categoría actual
  if (!term) return store.productsByCat(catId);

  // Si hay texto, buscamos en TODOS los productos (todas las familias)
  return store.products.filter(p => p.name.toLowerCase().includes(term));
});

function goBack() { router.push(`/mesa/${tableId}/categorias`); }
function add(pid) {
  pressedId.value = pid;
  store.addToCart(tableId, pid);
  setTimeout(() => (pressedId.value = null), 150);
}

function goPlanos() {
  if (hasDraft.value) {
    confirmLeave.value = true;
    return;
  }
  // si no hay draft, pero la mesa está free, resetea comensales al salir (punto 3)
  if (table.value?.status === "free") store.setDiners(tableId, 0);
  router.push("/planos");
}

function send() { store.sendCart(tableId);
  router.push("/planos");
 }

 function openDiners() {
  // abre tu DinersModal (como lo tienes en PlanosView)
  diners.open = true;
  diners.tableId = tableId;
  diners.initial = table.value?.diners || 2;
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
.top{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.back{ border:1px solid #eee; background:#fff; border-radius:12px; padding:10px 12px; }
.title{ font-weight: 900; }
.send{ border:1px solid #eee; background:#fff; border-radius:12px; padding:10px 14px; font-weight: 800; }
.send.hot{
  background:#ff8c2a;
  border-color:#ff8c2a;
  color:#fff;
}

.search{ width:100%; margin-top: 12px; border:1px solid #eee; border-radius:12px; padding: 12px; }

.list {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.prod{ display:flex; justify-content:space-between; align-items:center;min-height: 64px;
  border:1px solid #eee; background:#fff; border-radius:12px; padding: 17px;transition: transform 120ms ease, box-shadow 100ms ease;
}
.prod.pressed {
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(0,0,0,.12);
}
.pname{ font-weight: 800; }
.price{ opacity:.7; }
</style>
