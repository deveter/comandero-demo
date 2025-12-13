<template>
  <div class="overlay">
    <div class="panel">
      <img class="logo" :src="logoUrl" alt="TIPSI" />

      <div class="title">ACCESO</div>
      <div class="subtitle">Por favor introduce tu código para acceder</div>

      <div class="inputRow" :class="{ error: !!error }">
        <input class="pin" :type="'password'" :value="masked" readonly />
        <button class="clear" @click="clear">✕</button>
      </div>

      <div v-if="error" class="err">{{ error }}</div>

      <NumericKeypad
        variant="round"
        @digit="add"
        @back="back"
        @ok="ok"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import NumericKeypad from "./NumericKeypad.vue";
import logoUrl from "../assets/tipsi-logo.png";

const props = defineProps({
  user: Object,
  error: { type: String, default: "" },
});
const emit = defineEmits(["close", "confirm"]);

const pin = ref("");

const masked = computed(() => "•".repeat(pin.value.length));

function add(n) {
  if (pin.value.length >= 6) return;
  pin.value += String(n);
}
function back() {
  pin.value = pin.value.slice(0, -1);
}
function clear() {
  pin.value = "";
}
function ok() {
  emit("confirm", pin.value);
}
</script>

<style scoped>
.overlay{
  position:fixed;
  inset:0;
  background:#fff; /* en el mock es pantalla blanca, no modal oscuro */
  padding: 14px 18px;
}

.panel{
  max-width: 420px;
  margin: 0 auto;
  margin-top: 150px;
}

.logo{
  width: 150px;
  margin: 24px auto 18px;
  display:block;
}

.title{
  text-align:center;
  font-weight: 900;
  letter-spacing: 1px;
  margin-top: 8px;
}

.subtitle{
  text-align:center;
  opacity:.7;
  font-size:12px;
  margin-top: 6px;
}

.inputRow{
  margin-top: 18px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  display:flex;
  align-items:center;
  padding: 10px 10px;
}
.inputRow.error{
  border-color: #ff4d4f;
}

.pin{
  border:0;
  outline:0;
  flex:1;
  font-size: 18px;
  letter-spacing: 6px;
  background: transparent;
}

.clear{
  border:0;
  background:transparent;
  font-size: 16px;
  cursor:pointer;
  opacity:.65;
}

.err{
  margin-top: 8px;
  color:#ff4d4f;
  font-size: 12px;
  font-weight: 700;
  text-align:left;
}
</style>
