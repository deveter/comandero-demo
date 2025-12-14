<template>
  <div class="page">
    <div class="top">
      <button class="back" @click="router.back()"><img class="icon-back" src="../assets/arrow.png" alt=""></button>
      <div class="title">{{ title }}</div>
      <div style="width:44px"></div>
    </div>

    <div class="card">
      <div class="sectionTitle">Impresoras físicas</div>

      <div class="printerRow" v-for="p in printers" :key="p.id">
        <div class="pName">{{ p.name }}</div>

        <!-- selector fake -->
        <button class="pick" :class="{ on: selected === p.id }" @click="selected = p.id">
          <span v-if="selected === p.id">✓</span>
          <span v-else>×</span>
        </button>
      </div>

      <div class="divider"></div>

      <div class="sectionTitle">Número de copias</div>

      <div class="copies">
        <div class="copyRow" v-for="c in copyKeys" :key="c.key">
          <div class="cLabel">{{ c.label }}</div>
          <input class="cInput" type="number" min="0" v-model.number="copies[c.key]" />
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="save" @click="router.back()">Guardar</button>
      <button class="cancel" @click="router.back()">Cancelar</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const key = computed(() => String(route.params.key || ""));

const title = computed(() => {
  const map = {
    ticket: "Tickets",
    marchay: "Marcha y sigue",
    precioLibre: "Artículo precio libre",
    barra: "Barra",
    cocina: "Cocina",
    default: "Por defecto",
  };
  return map[key.value] || "Selección de impresora";
});

// Fake: lista de impresoras
const printers = [
  { id: "fax", name: "Fax" },
  { id: "pdf", name: "Microsoft print to PDF" },
  { id: "xps", name: "Microsoft XPS Document Writer" },
];

const selected = ref("pdf");

// Fake: nº copias por tipo de salida (como en tu imagen)
const copyKeys = [
  { key: "cambioMesa", label: "Cambio de mesa" },
  { key: "marchay", label: "Marcha y sigue" },
  { key: "comanda", label: "Comanda" },
];

const copies = reactive({
  cambioMesa: 1,
  marchay: 1,
  comanda: 1,
});
</script>

<style scoped>
.page{
  min-height:100vh;
  background:transparent;
  padding: 14px;
  padding-bottom: 110px;
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
  padding: 14px;
}

.sectionTitle{
  font-weight: 900;
  margin-bottom: 10px;
}

.printerRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 10px 0;
}

.pName{
  font-weight: 800;
  opacity:.9;
}

.pick{
  width: 34px;
  height: 28px;
  border-radius: 10px;
  border: 0;
  background: #f0f0f0;
  font-weight: 900;
  cursor:pointer;
  display:grid;
  place-items:center;
  opacity:.7;
}
.pick.on{
  background:#163357;
  color:#fff;
  opacity: 1;
}

.divider{
  height: 1px;
  background:#eee;
  margin: 14px 0;
}

.copies{ display:grid; gap: 10px; }

.copyRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
}

.cLabel{
  font-weight: 800;
  opacity:.85;
}

.cInput{
  width: 56px;
  text-align:center;
  border:1px solid #eee;
  border-radius: 10px;
  padding: 8px 6px;
  font-weight: 900;
}

.actions{
  margin-top: 18px;
  display:grid;
  gap: 10px;
}

.save{
  width:100%;
  border: 0;
  border-radius: 12px;
  padding: 14px;
  background: #163357;
  color: #fff;
  font-weight: 900;
  font-size: larger;
}

.cancel{
  width:100%;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 14px;
  background: #fff;
  font-weight: 900;
  opacity:.9;
  font-size: larger;
}

.icon-back{
  max-width: 13px;
}
</style>
