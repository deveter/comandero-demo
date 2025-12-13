<template>
  <button class="card" @click="$emit('select')">
    <div class="avatarWrap">
      <img v-if="user.avatar" class="avatar" :src="user.avatar" alt="" />
      <div v-else class="avatar placeholder">👤</div>

      <div v-if="user.requiresPin" class="lock" title="Requiere PIN">🔒</div>
    </div>

    <div class="name">{{ user.name }}</div>
    <div class="surname">{{ user.surname }}</div>
  </button>
</template>

<script setup>
defineProps({ user: { type: Object, required: true } });
defineEmits(["select"]);
</script>

<style scoped>
.card{
  border:1px solid #e9e9e9;
  background:#fff;
  border-radius: 14px;
  padding: 10px 8px 12px;
  text-align:center;
}
.avatarWrap{
  position:relative;
  display:grid;
  place-items:center;
}
.avatar{
  width: 56px;
  height: 56px;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid #f1f1f1;
}
.placeholder{
  display:grid;
  place-items:center;
  font-size: 22px;
  background:#f3f3f3;
  color:#666;
}
.lock{
  position:absolute;
  right: 6px;
  top: 0px;
  font-size: 14px;
}
.name{
  margin-top: 8px;
  font-weight: 900;
  font-size: 12px;
}
.surname{
  font-weight: 900;
  font-size: 12px;
  opacity:.75;
}
</style>
