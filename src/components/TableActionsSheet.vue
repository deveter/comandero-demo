<template>
  <div class="overlay" @click="$emit('close')">
    <div class="sheet" @click.stop>
      <div class="title">Mesa {{ tableName }}</div>

      <div class="grid">
        <button class="a" @click="$emit('edit-diners')">Editar<br/>comensales</button>
        <button class="a" @click="$emit('discount')">Aplicar<br/>descuento</button>
        <button class="a" @click="$emit('print')">Imprimir<br/>cuenta</button>
        <button class="a" @click="$emit('pay')">Cobrar<br/>cuenta</button>
      </div>

      <button class="close" @click="$emit('close')">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ tableName: { type: String, default: "" } });
defineEmits(["close","edit-diners","discount","print","pay"]);
</script>

<style scoped>
.overlay{ position:fixed; inset:0; background: rgba(0,0,0,.35); display:grid; place-items:end center; }
.sheet{ width:100%; max-width:520px; background:#fff; border-top-left-radius:18px; border-top-right-radius:18px; padding:14px; }
.title{ font-weight:900; margin-bottom: 10px; }
.grid{ display:grid; grid-template-columns: repeat(4,1fr); gap:10px; }
.a{ border:1px solid #eee; background:#fff; border-radius:14px; padding:10px 6px; font-weight:800; font-size:12px; }
.close{ margin-top:12px; width:100%; border:1px solid #eee; background:#fff; border-radius:14px; padding:12px; font-weight:900; }
</style>
