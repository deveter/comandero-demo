<script setup>
import { onMounted } from "vue";
import { useDemoStore } from "./stores/demo";

const store = useDemoStore();
onMounted(() => store.hydrate());
</script>

<template>
  <router-view />
</template>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap");
  body{
  background: #f3f3f3c4 !important;
  font-family: Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}
</style>

