<template>
  <div class="page">
    <!-- TOPBAR (zelfde look als dashboard) -->
    <header class="topbar">
      <div class="topbarLeft">
        <div class="brand">Task Manager</div>

        <div class="search">
          <input class="searchInput" placeholder="Search"/>
        </div>
      </div>

      <div class="topbarRight">
        <nav class="topLinks">
        </nav>

        <div class="topIcons">
          <button class="iconBtn" title="Help">?</button>
          <button class="iconBtn" title="Setting">⚙</button>
          <button class="iconBtn" title="Account">👤</button>
        </div>
      </div>
    </header>

    <div class="body">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebarTitle">Settings</div>

        <div class="sidebarSection">
          <button
            :class="{ active: activeTab === 'general' }"
            class="tabBtn"
            @click="activeTab = 'general'"
          >
            General
          </button>

          <button
            :class="{ active: activeTab === 'user' }"
            class="tabBtn"
            @click="activeTab = 'user'"
          >
            User
          </button>

          <button
            :class="{ active: activeTab === 'items' }"
            class="tabBtn"
            @click="activeTab = 'items'"
          >
            Items and Lists
          </button>

          <button
            :class="{ active: activeTab === 'workspace' }"
            class="tabBtn"
            @click="activeTab = 'workspace'"
          >
            Work Space
          </button>
        </div>

        <!-- bottom pinned -->
        <div class="sidebarBottom">
          <button class="dashBtn" @click="goDashboard">Dashboard</button>
          <button class="logoutBtn" @click="logout">Logout</button>
        </div>
      </aside>

      <!-- CONTENT -->
      <main class="content">
        <SettingsGeneral v-if="activeTab === 'general'"/>

        <SettingsUser
          v-if="activeTab === 'user' && userSubView === 'profile'"
          @manage="userSubView = 'manage'"
        />

        <SettingsUserManage
          v-if="activeTab === 'user' && userSubView === 'manage'"
          @back="userSubView = 'profile'"
        />

        <SettingsItems v-if="activeTab === 'items'"/>
        <SettingsWorkspace v-if="activeTab === 'workspace'"/>
      </main>


    </div>
  </div>

</template>

<script setup>
import {onMounted, ref} from "vue"
import {useRouter} from "vue-router"
import {useAuthStore} from "@/api/auth"

import SettingsGeneral from './SettingsGeneral.vue'
import SettingsItems from './SettingsItems.vue'
import SettingsWorkspace from './SettingsWorkspace.vue'
import SettingsUser from '@/pages/settings/SettingsUser.vue'
import SettingsUserManage from './settingUser-manage.vue'


const router = useRouter()
const auth = useAuthStore()

const activeTab = ref("general")
const userSubView = ref('profile')


// demo user data (later uit JWT / API halen)
const userName = ref("Rohullah Rasooli")
const userHandle = ref("@R.rasooli5")
const email = ref("2155262@talnet.nl")
const password = ref("*************")

const stats = ref({
  workspaces: 9,
  todo: 59,
  inProgress: 112,
  done: 211,
})

// theme (simpel via localStorage)
const theme = ref(localStorage.getItem("theme") || "dark")

function setTheme(value) {
  theme.value = value
  localStorage.setItem("theme", value)
  // hier koppel je later aan Vuetify theme switch (als je dat al hebt)
  document.documentElement.setAttribute("data-theme", value)
}

onMounted(() => {
  // standaard op User laten openen als je wil:
  // activeTab.value = "user"
  setTheme(theme.value)
})

function goDashboard() {
  router.push("/dashboard")
}

function logout() {
  auth.logout()
  router.push("/login")
}

function manageAccount() {
  alert("Later: manage account")
}
</script>

<style scoped>
/* ====== dezelfde donkere look als dashboard ====== */
.page {
  min-height: 100vh;
  background: #1f2836;
  color: #e9eef7;
}

.topbar {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 18px;
  background: #1a2230;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 14px;
}

.topbarLeft,
.topbarRight {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbarLeft {
  flex: 1;
}

.topbarRight {
  justify-content: flex-end;
}

.brand {
  font-size: 22px;
  font-weight: 800;
}

.search {
  flex: 1;
  max-width: 520px;
}

.searchInput {
  width: 100%;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #111827;
  color: #e9eef7;
  padding: 0 10px;
  outline: none;
}

.topLinks {
  display: flex;
  gap: 16px;
  margin-left: 6px;
}

.topLink {
  color: rgba(233, 238, 247, 0.85);
  text-decoration: none;
  font-size: 13px;
}

.topIcons {
  display: flex;
  gap: 10px;
  margin-left: 6px;
}

.iconBtn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #111827;
  color: #e9eef7;
  cursor: pointer;
}

/* ===== layout ===== */
.body {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 18px;
  padding: 16px;
}

.sidebar {
  background: #2a3446;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
}

.sidebarTitle {
  font-weight: 900;
  font-size: 22px;
  padding: 14px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.18);
  margin-bottom: 14px;
  text-align: center;
}

.sidebarSection {
  display: grid;
  gap: 12px;
  padding: 6px;
}

.tabBtn {
  text-align: left;
  padding: 12px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.12);
  color: #e9eef7;
  cursor: pointer;
  font-weight: 700;
}

.tabBtn.active {
  background: #3b82f6;
  color: #111827;
  font-weight: 900;
}

.sidebarBottom {
  margin-top: auto;
  display: grid;
  gap: 10px;
  padding: 10px 6px 6px 6px;
}

.dashBtn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
  color: #e9eef7;
  cursor: pointer;
  font-weight: 800;
}

.logoutBtn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #ef4444;
  color: white;
  cursor: pointer;
  font-weight: 900;
}

.content {
  background: #2a3446;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: calc(100vh - 96px);
  padding: 18px;
  position: relative;
  overflow: hidden;
}

/* ===== Cards ===== */
.card {
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
}

.h2 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 900;
}

.p {
  margin: 0;
  opacity: 0.8;
}

/* ===== General theme toggles (wireframe-style) ===== */
.themeRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  margin-bottom: 12px;
}

.darkRow {
  background: rgba(0, 0, 0, 0.25);
}

.themeLabel {
  font-weight: 800;
}

/* switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: .2s;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  top: 2px;
  background-color: white;
  transition: .2s;
  border-radius: 999px;
}

.switch input:checked + .slider {
  background-color: rgba(34, 197, 94, 0.35);
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
}

/* ===== User page (wireframe look) ===== */
.userWrap {
  height: 100%;
  display: grid;
  gap: 18px;
}

.userHero {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding-top: 10px;
}

.avatarBig {
  width: 92px;
  height: 92px;
  border-radius: 999px;
  background: #f59e0b;
  display: grid;
  place-items: center;
  font-size: 44px;
  color: #111827;
  border: 4px solid rgba(255, 255, 255, 0.25);
}

.userName {
  font-size: 22px;
  font-weight: 900;
}

.userHandle {
  opacity: 0.75;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
  padding: 10px 6px;
}

.stat {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  padding: 12px;
  text-align: center;
}

.statNum {
  font-size: 18px;
  font-weight: 900;
}

.statLbl {
  font-size: 12px;
  opacity: 0.75;
  margin-top: 4px;
}

.userForm {
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
}

.field {
  margin-bottom: 14px;
}

.fieldLabel {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 6px;
}

.fieldLine {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.22);
  padding-bottom: 6px;
}

.fieldInput {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  color: #e9eef7;
  padding: 6px 0;
}

.fieldIcon {
  opacity: 0.7;
}

.manageBtn {
  margin-top: 10px;
  width: 180px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.25);
  color: #e9eef7;
  font-weight: 900;
  cursor: pointer;
}

/* responsive */
@media (max-width: 1100px) {
  .body {
    grid-template-columns: 1fr;
  }

  .sidebar {
    height: auto;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
