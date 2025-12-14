<template>
  <div class="overlay">
    <div class="panel">
    

      <!-- header -->
      <div class="header">
        <button class="close" @click="$emit('close')">✕</button>
        <div class="hTitle">Iniciar mesa</div>
      </div>

      <div class="sub">Ingresa la cantidad de comensales</div>

      <!-- pill mesa -->
      <div class="pill">Mesa Nº {{ tableLabel }}</div>

      <!-- número grande -->
      <div class="big">{{ value ?? 0 }}</div>


      <div class="rowUnder">
        <span class="people"><img class="icon-people" src="../assets/user.png" alt=""></span>
        <span class="underTxt">Comensales</span>
      </div>

      <!-- teclado -->
      <div class="keypad">
        <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="k" @click="add(n)">{{ n }}</button>

        <button class="k ghost" disabled>,</button>
        <button class="k" @click="add(0)">0</button>
        <button class="k" @click="back">⌫</button>
      </div>

      <!-- aceptar -->
      <button class="accept" :class="{ active: canAccept }" :disabled="!canAccept" @click="accept">
        Aceptar
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  tableName: { type: String, default: "" },     // "Mesa 2" o "2" o "Barra 1"
  initial: { type: Number, default: 0 },
});
const emit = defineEmits(["close", "accept"]);

const value = ref(null);


watch(
  () => props.initial,
  (v) => {
    value.value = Number.isFinite(v) && v > 0 ? v : null;
  },
  { immediate: true }
);

const tableLabel = computed(() => {
  // si viene "Mesa 2", mostramos "2"; si viene "2" también
  const s = String(props.tableName || "").trim();
  const m = s.match(/(\d+)/);
  return m ? m[1] : s || "—";
});

const canAccept = computed(() => value.value !== null && value.value > 0);

function add(n) {
  const base = value.value === null ? "" : String(value.value);
  const next = base + String(n);
  value.value = Math.min(99, parseInt(next, 10));
}

function back() {
  if (value.value === null) return;
  const s = String(value.value);
  if (s.length <= 1) {
    value.value = null;
  } else {
    value.value = parseInt(s.slice(0, -1), 10);
  }
}


function accept() {
  emit("accept", value.value);
}

</script>

<style scoped>
.overlay{
  position: fixed;
  inset: 0;
  background: white !important;
  z-index: 9999;

  /* MUY IMPORTANTE */
  overscroll-behavior: contain;
  touch-action: none;
}


.panel{
  width:90%;
  margin: 0 auto;
  padding: 10px 18px 18px;
  
}

.topbar{
  display:flex;
  justify-content:space-between;
  opacity:.75;
  font-size:12px;
  margin: 2px 0 10px;
}

.header{
  display:flex;
  align-items:center;
  gap: 10px;
  margin-top: 6px;
}

.close{
  border: 0;
  background: transparent;
  font-size: 20px;
  padding: 6px 6px;
  opacity: .8;
}

.hTitle{
  font-weight: 900;
}

.sub{
  margin-top: 10px;
  font-size: 12px;
  opacity: .7;
}

.pill{
  margin: 22px auto 8px;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  font-weight: 900;
  font-size: 12px;
}

.big{
  text-align:center;
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
  margin-top: 6px;
}

.rowUnder{
  margin-top: 6px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 8px;
  font-size: 12px;
  opacity: .75;
  font-weight: 800;
}

.keypad{
  margin-top: 28px;
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.k{
  height: 42px;
  border-radius: 12px;
  border: 0;
  background: #efefef;
  font-weight: 900;
  font-size: 14px;
}

.ghost{
  background: #efefef;
  opacity: .35;
}

.accept{
  margin-top: 16px;
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 14px;
  font-weight: 900;
  background: #d9d9d9;
  color: #fff;
}
.accept.active{
  background: #0d1b2a;
}
.accept:disabled{
  cursor:not-allowed;
}
</style>


<style scoped>
.overlay{ position:fixed; inset:0; background: rgba(0,0,0,.35); display:grid; place-items:center; }
.modal{ width:min(360px, 92vw); background:#fff; border-radius:16px; padding:14px; }
.t{ font-weight:900; margin-bottom: 10px; }
.inp{ width:100%; border:1px solid #eee; border-radius:12px; padding:12px; font-size:16px; }
.row{ display:flex; gap:10px; margin-top: 12px; }
.b{ flex:1; border:1px solid #eee; background:#fff; border-radius:12px; padding:12px; font-weight:900; }
.ok{ background:#0d1b2a; color:#fff; border-color:#0d1b2a; }
.icon-people{
  max-width: 18px;
}
</style>
