<template>
  <div class="keypad" :class="{ round: variant==='round' }">
    <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="k" @click="$emit('digit', n)">
      {{ n }}
    </button>

    <button class="k ghost" @click="$emit('back')">·</button>
    <button class="k" @click="$emit('digit', 0)">0</button>
    <button class="k ok" @click="$emit('ok')">OK</button>
  </div>
</template>

<script setup>
defineProps({ variant: { type: String, default: "round" } });
defineEmits(["digit", "back", "ok"]);
</script>

<style scoped>
.keypad{
  margin-top: 18px;
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  justify-items: center;
}

.k{
  width: 58px;
  height: 58px;
  border-radius: 999px;
  border: 0;
  background: #efefef;
  font-weight: 900;
  font-size: 16px;
  cursor: pointer;
}

.ghost{
  background: transparent;
  color: transparent;
}

.ok{
  background: #0d1b2a;
  color: #fff;
}
</style>
