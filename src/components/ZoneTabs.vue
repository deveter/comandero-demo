<template>
  <div class="tabs-wrap">
    <div class="tabs">
      <button
        v-for="z in zones"
        :key="z.id"
        class="tab"
        :class="{ active: z.id === modelValue }"
        @click="$emit('update:modelValue', z.id)"
      >
        {{ z.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  zones: { type: Array, default: () => [] },
  modelValue: { type: String, required: true },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
/* CONTENEDOR GRIS DEL CARRUSEL */
.tabs-wrap{
  background:#e9eaec;          /* gris más oscuro como el mock */
  border-radius: 16px;
  padding: 6px;
  overflow: hidden;
}

/* CARRUSEL */
.tabs{
  display:flex;
  gap:6px;
  overflow-x:auto;
  -webkit-overflow-scrolling: touch;
}

/* OCULTAR SCROLLBAR */
.tabs::-webkit-scrollbar{
  display:none;
}

/* TAB NORMAL (NO ACTIVA) */
.tab{
  border:none;                 /* 🔴 NO borde */
  background:transparent;      /* 🔴 mismo fondo gris */
  padding:8px 14px;
  border-radius: 6px;
  white-space: nowrap;
  font-weight: 800;
  font-size: 0.85rem;
  color:#1a1a1a;
  opacity:.9;
}

/* TAB ACTIVA */
.tab.active{
  background:#163357;          /* azul oscuro */
  color:#fff;
  border:1px solid #163357;    /* solo la activa tiene borde */
  opacity:1;
}
</style>
