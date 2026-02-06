<template>
  <div class="card">
    <div class="buttons-user">
      <h2 class="user-top">Users</h2>
      <button><h2 class="user-top">Invite a user -></h2></button>

    </div>


    <div class="avatar">
      <div class="circle">{{ initials }}</div>
      <div class="info">
        <div class="name">{{ userName }}</div>
        <div class="email">{{ userEmail }}</div>
        <button class="manageBtn" @click="$emit('manage')">
          Manage Account
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useAuthStore} from '@/api/auth'

const auth = useAuthStore()

const userEmail = computed(() => auth.userEmail ?? 'unknown@email.com')
const userName = computed(() => {
  const mail = auth.userEmail ?? ''
  const left = mail.split('@')[0] || 'User'
  return left.charAt(0).toUpperCase() + left.slice(1)
})
const initials = computed(() => auth.userInitials)

defineEmits(['manage'])
</script>


<style scoped>
.card {
  background: #1f2836;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
}

h2 {
  margin-bottom: 14px;
}

.avatar {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 14px;
}

.info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-right: 140px;
  padding-left: 140px;
  align-items: center;
  width: 100%;
  gap: 14px;
}

.user-top {
  padding-bottom: 34px;
}

.buttons-user {
  display: flex;
  gap: 120px;
}

.circle {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #f59e0b;
  color: #111827;
  display: grid;
  place-items: center;
  font-weight: 900;
}

.name {
  font-weight: 800;
}

.email {
  font-size: 13px;
  opacity: 0.75;
}
</style>
