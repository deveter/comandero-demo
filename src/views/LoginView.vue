<template>
  <div class="page">
    <!-- Barra superior fake (hora / iconos) -->
    <div class="topbar">
      <div class="time">9:30</div>
      <div class="icons">📶 🔋</div>
    </div>

    <!-- Logo -->
    <img class="logo" :src="logoUrl" alt="TIPSI" />

    <!-- Títulos -->
    <div class="title">USUARIOS</div>
    <div class="subtitle">
      Por favor selecciona tu usuario para acceder
    </div>

    <!-- Grid usuarios (2 columnas) -->
    <div class="grid">
      <UserCard
        v-for="u in store.users"
        :key="u.id"
        :user="u"
        @select="selectUser(u)"
      />
    </div>

    <!-- Overlay PIN -->
    <PinOverlay
      v-if="pin.open"
      :user="pin.user"
      :error="pin.error"
      @confirm="confirmPin"
      @close="closePin"
    />
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useDemoStore } from "../stores/demo";

import UserCard from "../components/UserCard.vue";
import PinOverlay from "../components/PinOverlay.vue";

// logo (robusto con Vite)
const logoUrl = new URL("../assets/tipsi-logo.png", import.meta.url).href;

const store = useDemoStore();
const router = useRouter();

const pin = reactive({
  open: false,
  user: null,
  error: "",
});

function selectUser(user) {
  if (!user.requiresPin) {
    store.login(user);
    router.push("/planos");
    return;
  }

  pin.open = true;
  pin.user = user;
  pin.error = "";
}

function closePin() {
  pin.open = false;
  pin.user = null;
  pin.error = "";
}

function confirmPin(value) {
  if (!value) {
    pin.error = "Campo requerido";
    return;
  }
  if (value !== pin.user.pin) {
    pin.error = "Contraseña incorrecta, inténtelo nuevamente";
    return;
  }

  store.login(pin.user);
  closePin();
  router.push("/planos");
}
</script>

<style scoped>
.page{
  min-height:100vh;
  background: white !important;
  padding: 14px 18px 24px;
}

/* barra superior */
.topbar{
  display:flex;
  justify-content:space-between;
  opacity:.75;
  font-size:12px;
  margin-bottom: 12px;
}

/* logo */
.logo{
  width: 150px;
  margin: 130px auto 40px;
  display:block;
  
}

/* textos */
.title{
  text-align:center;
  font-weight: 700;
  letter-spacing: 1px;
  margin-top: 8px;
}
.subtitle{
  text-align:center;
  opacity:.7;
  font-size:16px;
  margin-top: 6px;
}

/* grid usuarios */
.grid{
  margin-top: 18px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
</style>
