<template>
  <div class="overlay" @click="$emit('cancel')">
    <div class="modal" @click.stop>
      <div class="title">Hay productos en la comanda</div>
      <div class="sub">¿Quieres salir sin enviar?</div>

      <div class="row">
        <button class="btn" @click="$emit('leave')">Salir</button>
        <button class="btn primary" @click="$emit('send')">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(["cancel", "leave", "send"]);
</script>

<style scoped>
.overlay{ position:fixed; inset:0; background: rgba(0,0,0,.35); display:grid; place-items:center; }
.modal{ width:min(360px, 92vw); background:#fff; border-radius:16px; padding:14px; }
.title{ font-weight:900; font-size:16px; }
.sub{ margin-top:6px; opacity:.75; }
.row{ display:flex; gap:10px; margin-top:14px; }
.btn{ flex:1; border:1px solid #eee; background:#fff; border-radius:12px; padding:12px; font-weight:900; }
.primary{ background:#ff5757; border-color:#ff5757; color:#fff; }
</style>
