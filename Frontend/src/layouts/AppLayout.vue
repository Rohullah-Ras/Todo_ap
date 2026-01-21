<template>
  <v-app>
    <v-app-bar class="appbar" flat height="64">
      <v-toolbar-title class="title">Task Manager</v-toolbar-title>

      <div class="search-wrap">
        <v-text-field
            v-model="q"
            class="search"
            density="compact"
            hide-details
            placeholder="Search"
            variant="solo"
        />
      </div>

      <v-btn class="ml-3" color="success" variant="flat" @click="openCreate = true">
        Create Task
      </v-btn>

      <v-spacer/>

      <v-btn icon variant="text">
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>
      <v-btn icon variant="text">
        <v-icon>mdi-cog-outline</v-icon>
      </v-btn>

      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props" variant="text">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :title="auth.user?.username ?? 'Account'"/>
          <v-list-item title="Logout" @click="logout"/>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="main">
      <router-view v-model:search="q" @open-create="openCreate = true"/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth'

const auth = useAuthStore()
const q = ref('')
const openCreate = ref(false)

async function logout() {
  await auth.logout()
  window.location.href = '/auth/sign-in'
}
</script>

<style scoped>
.appbar {
  background: #1f2a3d;
  color: #e8eefc;
}

.title {
  font-weight: 700;
}

.main {
  background: #222c40;
  min-height: calc(100vh - 64px);
}

.search-wrap {
  width: 360px;
  max-width: 42vw;
  margin-left: 16px;
}

.search :deep(.v-field) {
  background: rgba(255, 255, 255, 0.10);
  border-radius: 10px;
}

.search :deep(input) {
  color: #e8eefc;
}
</style>