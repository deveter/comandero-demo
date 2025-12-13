<template>
  <div class="page">
    <div class="top">
      <button class="back" @click="goPlanos">← Planos</button>
      <div class="title">Mesa {{ table?.name }}</div>

      <button class="send" :class="{ hot: hasDraft }" @click="send">
        Enviar
      </button>
    </div>

    <input
      class="search"
      placeholder="Buscar producto..."
      v-model="q"
    />

    <!-- ========================= -->
    <!-- CON BÚSQUEDA: PRODUCTOS -->
    <!-- ========================= -->
    <div v-if="q.trim().length > 0" class="results">
      <button
        v-for="p in filteredProducts"
        :key="p.id"
        class="prod"
        @click="store.addToCart(tableId, p.id)"
      >
        <div class="pname">{{ p.name }}</div>
        <div class="price">{{ p.price.toFixed(2) }} €</div>
      </button>

      <div v-if="filteredProducts.length === 0" class="empty">
        No hay productos con ese nombre.
      </div>
    </div>

    <!-- ========================= -->
    <!-- SIN BÚSQUEDA: HEADER + CATEGORÍAS -->
    <!-- ========================= -->
    <div v-else>
      <div class="catHeader">
  <div class="catHeaderLeft">Categorías</div>

  <div class="catHeaderRight">
    <select v-model="course" class="courseSelect">
      <option>Comanda</option>
      <option>Entrantes</option>
      <option>Primero</option>
      <option>Segundo</option>
      <option>Postre</option>
      <option>Bebida</option>
    </select>
  </div>
</div>


      <div class="grid">
        <button
          v-for="c in store.categories"
          :key="c.id"
          class="cat"
          @click="goCat(c.id)"
        >
          {{ c.name }}
        </button>
      </div>
    </div>

    <!-- ========================= -->
    <!-- ORDER SHEET -->
    <!-- ========================= -->
    <OrderSheet
      :tableId="tableId"
      @inc-pending="(idx) => store.incDraft(tableId, idx)"
      @dec-pending="(idx) => store.decDraft(tableId, idx)"
      @edit-diners="openDiners"
      @pay="goPay"
      @print="printBill"
    />

    <!-- ========================= -->
    <!-- CONFIRMAR SALIDA -->
    <!-- ========================= -->
    <ConfirmLeaveModal
      v-if="confirmLeave"
      @cancel="confirmLeave = false"
      @leave="() => {
        confirmLeave = false;
        store.discardDraft(tableId);
        router.push('/planos');
      }"
      @send="() => {
        confirmLeave = false;
        store.sendCart(tableId);
        router.push('/planos');
      }"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDemoStore } from "../stores/demo";

import OrderSheet from "../components/OrderSheet.vue";
import ConfirmLeaveModal from "../components/ConfirmLeaveModal.vue";

const store = useDemoStore();
const router = useRouter();
const route = useRoute();

const tableId = route.params.tableId;
const table = computed(() => store.tableById(tableId));
const draft = computed(() => store.draftFor(tableId));

const confirmLeave = ref(false);
const q = ref("");

// selector turno
const course = computed({
  get: () => store.ui.course || "Comanda",
  set: (v) => {
    store.ui.course = v;
    store.persist?.();
  },
});

const hasDraft = computed(() => draft.value.items.length > 0);

// búsqueda global de productos
const filteredProducts = computed(() => {
  const term = q.value.trim().toLowerCase();
  if (!term) return [];
  return store.products.filter((p) =>
    p.name.toLowerCase().includes(term)
  );
});

function goPlanos() {
  if (hasDraft.value) {
    confirmLeave.value = true;
    return;
  }

  if (table.value?.status === "free") {
    store.setDiners(tableId, 0);
  }

  router.push("/planos");
}

function goCat(catId) {
  router.push(`/mesa/${tableId}/categoria/${catId}`);
}

function send() {
  store.sendCart(tableId);
  router.push("/planos");
}

function openDiners() {
  // se gestiona como ya lo tienes en PlanosView
}

function goPay() {
  router.push(`/mesa/${tableId}/cobro`);
}

function printBill() {
  store.requestBill(tableId);
  router.push("/planos");
}
</script>

<style scoped>
.page{ min-height:100vh; background:transparent; padding: 10px; padding-bottom: 110px; }
.top{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.back{ border:1px solid #eee; background:#fff; border-radius:12px; padding:10px 12px;border-color:#163357;border-width: 3px;font-size: medium;font-weight: 800; }
.title{ font-weight: 900; }
.send{ border:1px solid #eee; background:#dbdbdb; border-radius:12px; padding:20px 24px; font-weight: 900;font-size: larger;color:white}
.send.hot{ background:#ff5757; border-color:#ff5757; color:#fff; }

.search{ width:100%; margin-top: 12px; border:1px solid #eee; border-radius:12px; padding: 12px; }

.grid{ margin-top: 14px; display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cat{ border:1px solid #eee; background:#fff; border-radius:12px; padding: 17px 10px; font-weight: 900;color:#163357 }

.results{ margin-top: 14px; display:grid; gap: 10px; }
.prod{ display:flex; justify-content:space-between; border:1px solid #eee; background:#fff; border-radius:12px; padding: 14px; }
.pname{ font-weight: 900; }
.price{ opacity:.7; font-weight: 900; }
.empty{ opacity:.7; padding: 10px; }

.catHeader{
  margin-top: 14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.catHeaderLeft{
  font-weight: 900;
  font-size: 14px;
}

.catHeaderRight{
  display:flex;
  align-items:center;
}

.courseSelect{
  border:1px solid #e5e5e5;
  border-radius:10px;
  padding:8px 12px;
  font-weight:700;
  background:#fff;
}

</style>
