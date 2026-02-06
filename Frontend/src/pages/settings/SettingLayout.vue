<script setup>
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from '@/api/auth' // of '@/stores/auth' als je die zo hebt

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const menu = [
  {label: 'General', to: '/settings/general'},
  {label: 'User', to: '/settings/user'},
  {label: 'Items and Lists', to: '/settings/items'},
  {label: 'Work Space', to: '/settings/workspace'},
]

const isActive = (to) => route.path === to

const logout = async () => {
  auth.logout()
  await router.push('/login')
}

const goDashboard = async () => {
  await router.push('/dashboard')
}
</script>

<template>
  <div class="settingsPage">
    <!-- LEFT -->
    <aside class="settingsSidebar">
      <div class="sidebarTitle">Settings</div>

      <div class="menu">
        <button
          v-for="m in menu"
          :key="m.to"
          :class="{ active: isActive(m.to) }"
          class="menuItem"
          @click="router.push(m.to)"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="sidebarBottom">
        <button class="dashBtn" @click="goDashboard">Dashboard</button>
        <button class="logoutBtn" @click="logout">Logout</button>
      </div>
    </aside>

    <!-- RIGHT -->
    <main class="settingsContent">
      <router-view/>
    </main>
  </div>
</template>

<style scoped>
.settingsPage {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
  padding: 16px;
  background: #1f2836; /* dashboard background */
}

/* SIDEBAR */
.settingsSidebar {
  background: #2a3446;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: calc(100vh - 32px);
  position: sticky;
  top: 16px;

  display: flex;
  flex-direction: column;
}

.sidebarTitle {
  font-weight: 900;
  font-size: 16px;
  margin-bottom: 14px;
  color: #e9eef7;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menuItem {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
  color: #e9eef7;
  cursor: pointer;
}

.menuItem:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menuItem.active {
  background: #3b82f6; /* blauw zoals space/list active */
  font-weight: 800;
}

/* BOTTOM ACTIONS */
.sidebarBottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dashBtn {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.25);
  color: #e9eef7;
  cursor: pointer;
}

.logoutBtn {
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: #ef4444;
  color: white;
  font-weight: 800;
  cursor: pointer;
}

/* CONTENT */
.settingsContent {
  background: #2a3446;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px;
  min-height: calc(100vh - 32px);
  color: #e9eef7;
}

</style>
