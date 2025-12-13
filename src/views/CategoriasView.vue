<template>
  <div class="page">
    <div class="top">
      <button class="back" @click="goPlanos">← Planos</button>
      <div class="title">Mesa {{ table?.name }}</div>

      <button class="send" :class="{ hot: hasDraft }" @click="send">
        Enviar
      </button>
    </div>

    <input class="search" placeholder="Buscar producto..." v-model="q" />

    <!-- Si hay búsqueda: lista de productos -->
    <div v-if="q.trim().length>0" class="results">
      <button
        v-for="p in filteredProducts"
        :key="p.id"
        class="prod"
        @click="store.addToCart(tableId, p.id)"
      >
        <div class="pname">{{ p.name }}</div>
        <div class="price">{{ p.price.toFixed(2) }} €</div>
      </button>

      <div v-if="filteredProducts.length===0" class="empty">
        No hay productos con ese nombre.
      </div>
    </div>

    <!-- Sin búsqueda: grid de familias -->
    <div v-else class="grid">
      <button
        v-for="c in store.categories"
        :key="c.id"
        class="cat"
        @click="goCat(c.id)"
      >
        {{ c.name }}
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

const store = useDemoStore();
const route = useRoute();
const router = useRouter();

const tableId = route.params.tableId;
const table = computed(() => store.tableById(tableId));
const draft = computed(() => store.draftFor(tableId));

const confirmLeave = ref(false);
const hasDraft = computed(() => draft.value.items.length > 0);

const q = ref("");

const filteredProducts = computed(() => {
  const term = q.value.trim().toLowerCase();
  if (!term) return [];
  return store.products.filter(p => p.name.toLowerCase().includes(term));
});

function goPlanos() {
  if (hasDraft.value) {
    confirmLeave.value = true;
    return;
  }
  // si no hay draft, pero la mesa está free, resetea comensales al salir (punto 3)
  if (table.value?.status === "free") store.setDiners(tableId, 0);
  router.push("/planos");
}

function goCat(catId){ router.push(`/mesa/${tableId}/categoria/${catId}`); }
function send(){ store.sendCart(tableId);
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
.send{ border:1px solid #eee; background:#fff; border-radius:12px; padding:10px 14px; font-weight: 900; }
.send.hot{ background:#ff8c2a; border-color:#ff8c2a; color:#fff; } /* naranja cuando hay draft */

.search{ width:100%; margin-top: 12px; border:1px solid #eee; border-radius:12px; padding: 12px; }

.grid{ margin-top: 14px; display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cat{ border:1px solid #eee; background:#fff; border-radius:12px; padding: 17px 10px; font-weight: 900; }

.results{ margin-top: 14px; display:grid; gap: 10px; }
.prod{ display:flex; justify-content:space-between; border:1px solid #eee; background:#fff; border-radius:12px; padding: 14px; }
.pname{ font-weight: 900; }
.price{ opacity:.7; font-weight: 900; }
.empty{ opacity:.7; padding: 10px; }
</style>
