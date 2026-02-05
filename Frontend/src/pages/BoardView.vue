<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {api} from '@/api/http'
import {useAuthStore} from '@/api/auth'


const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const spaceId = ref(Number(route.params.spaceId) || 0)

const spaces = ref([])
const lists = ref([])
const tasks = ref([])

const search = ref('')
const selectedListId = ref(null)
const loading = ref(false)

const statuses = [
  {id: 1, title: 'TO DO'},
  {id: 2, title: 'IN PROGRESS'},
  {id: 3, title: 'DONE'},
]

const dragging = ref(null)

// --- modal state
const isModalOpen = ref(false)
const modalTab = ref('task') // 'task' | 'list'
const modalSaving = ref(false)

// form: task
const taskForm = ref({
  title: '',
  description: '',
  statusId: 1,
  listId: null,
})

// form: list
const listForm = ref({
  name: '',
})

// form: space
const spaceForm = ref({
  name: '',
  description: '',
})


// keep spaceId in sync with route
watch(
  () => route.params.spaceId,
  (val) => {
    const id = Number(val) || 0
    if (id) spaceId.value = id
  },
  {immediate: true}
)

const filteredLists = computed(() => {
  return lists.value
})


const effectiveSpaceId = computed(() => {
  const fromRoute = Number(route.params.spaceId)
  if (fromRoute) return fromRoute
  if (spaceId.value) return spaceId.value
  return spaces.value[0]?.id ?? 0
})

// UI helper: choose which list is active for the board
const activeList = computed(() => {
  if (selectedListId.value) return lists.value.find(l => l.id === selectedListId.value)
  return lists.value[0] ?? null
})
const activeListId = computed(() => activeList.value?.id ?? null)

const closeModal = () => {
  isModalOpen.value = false
}


const openCreateList = () => {
  modalTab.value = 'list'
  listForm.value = {name: ''}
  isModalOpen.value = true
}


const openCreateTask = () => {
  if (!spaces.value.length) {
    openCreateSpace()
    return
  }
  if (!lists.value.length) {
    openCreateList()
    return
  }

  modalTab.value = 'task'
  taskForm.value = {
    title: '',
    description: '',
    statusId: 1,
    listId: activeListId.value ?? lists.value[0]?.id ?? null,
  }
  isModalOpen.value = true
}


const openCreateSpace = () => {
  modalTab.value = 'space'
  spaceForm.value = {name: '', description: ''}
  isModalOpen.value = true
}


// const openCreateTask = () => {
//   if (!spaces.value.length) {
//     openCreateSpace()
//     return
//   }
//   if (!lists.value.length) {
//     openCreateList()
//     return
//   }
//
//   modalTab.value = 'task'
//   taskForm.value = {
//     title: '',
//     description: '',
//     statusId: 1,
//     listId: activeListId.value ?? lists.value[0]?.id ?? null,
//   }
//   isModalOpen.value = true
// }


const loadSpaces = async () => {
  console.log('TOKEN?', localStorage.getItem('access_token'))
  const res = await api.get('/spaces')
  spaces.value = res.data

  if (!spaceId.value && spaces.value.length) {
    spaceId.value = spaces.value[0].id
    router.replace(`/board/${spaceId.value}`)
  }
}

const loadBoard = async () => {
  if (!spaceId.value) return
  loading.value = true
  try {
    const resLists = await api.get(`/lists/space/${spaceId.value}`)
    lists.value = resLists.data

    const all = []
    for (const l of lists.value) {
      const resTasks = await api.get(`/tasks/list/${l.id}`)
      all.push(...resTasks.data)
    }
    tasks.value = all
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadSpaces()
  await loadBoard()
})


const logout = async () => {
  auth.logout()
  await router.push('/login')
}


const saveModal = async () => {
  if (modalSaving.value) return
  modalSaving.value = true

  try {
    if (modalTab.value === 'task') {
      const title = taskForm.value.title.trim()
      if (!title) return alert('Title is verplicht')

      const listId = taskForm.value.listId ?? activeListId.value
      if (!listId) return alert('Kies een list')

      await api.post('/tasks', {
        title,
        description: taskForm.value.description?.trim() || null,
        statusId: taskForm.value.statusId,
        listId,
      })

      closeModal()
      await loadBoard()
      return
    }

    if (modalTab.value === 'list') {
      const name = listForm.value.name.trim()
      if (!name) return alert('List naam is verplicht')

      const sid = effectiveSpaceId.value
      if (!sid) return alert('Geen space geselecteerd')

      await api.post('/lists', {name, spaceId: sid})

      closeModal()
      modalTab.value = 'task'
      await loadBoard()
      return
    }

    // modalTab === 'space'
    const name = spaceForm.value.name.trim()
    if (!name) return alert('Space naam is verplicht')

    const res = await api.post('/spaces', {name})

    const newId = res?.data?.id ?? 0
    await loadSpaces()

    if (newId) {
      spaceId.value = newId
      await router.push(`/board/${newId}`)
    }


    closeModal()
    modalTab.value = 'task'
    await loadBoard()
  } catch (err) {
    console.error('Save modal failed:', err)
    const msg =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      'Opslaan mislukt'
    alert(msg)
  } finally {
    modalSaving.value = false
  }
}

</script>


<template>
  <div class="page">
    <!-- TOPBAR -->
    <header class="topbar">
      <div class="topbarLeft">
        <div class="brand">Task Manager</div>

        <div class="search">
          <input v-model="search" class="searchInput" placeholder="Search"/>
        </div>

        <button class="createBtn" @click="openCreateTask">Create Task</button>
        <button class="createListBtn" @click="openCreateList">Create List</button>
        <button class="createListBtn" @click="openCreateSpace">Create Space</button>

      </div>

      <div class="topbarRight">
        <nav class="topLinks">
          <a class="topLink" href="#">Link four</a>
          <a class="topLink" href="#">Link three</a>
        </nav>

        <div class="topIcons">
          <button class="iconBtn" title="Help">?</button>
          <button class="iconBtn" title="Settings" @click="setting">⚙</button>
          <button class="iconBtn" title="Account">👤</button>
        </div>
      </div>

    </header>

    <!-- BODY -->
    <div class="body">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebarTitle">{{ currentSpaceName }}</div>

        <div class="sidebarSection">
          <div class="sidebarHeader">
            <span>Recent</span>
            <span class="menu">≡</span>
          </div>
          <button :class="{active: !selectedListId}" class="sidebarItem" @click="selectedListId = null">
            All
          </button>
        </div>

        <div class="sidebarSection">
          <div class="sidebarHeader">
            <span>Spaces</span>
            <span class="menu">▾</span>
          </div>

          <div class="spacesList">
            <button
              v-for="s in spaces"
              :key="s.id"
              :class="{active: s.id === spaceId}"
              class="spaceBtn"
              @click="openSpace(s.id)"
            >
              {{ s.name }}
            </button>
          </div>
        </div>

        <div class="sidebarSection">
          <div class="sidebarHeader">
            <span>Lists</span>
            <span class="menu">≡</span>
          </div>

          <div class="listsBox">
            <button
              v-for="l in filteredLists"
              :key="l.id"
              :class="{active: l.id === selectedListId}"
              class="listBtn"
              @click="selectedListId = l.id"
            >
              {{ l.name }}
            </button>
          </div>
        </div>

        <button class="dashBtn" @click="router.push('/dashboard')">Dashboard</button>
        <button class="logoutBtn" @click="logout">Logout</button>
      </aside>

      <!-- BOARD -->
      <main class="board">
        <div class="boardTop">
          <div class="chips">
            <span class="chip">Space</span>
            <span class="chip">Project</span>
            <span class="chip">Type</span>
          </div>

          <div class="boardTitle">
            {{ activeList?.name ?? 'Project' }}
          </div>
        </div>

        <div v-if="loading" class="loading">Loading...</div>

        <!-- columns for ACTIVE list only (like wireframe) -->
        <div v-if="activeListId" class="columns">
          <div
            v-for="st in statuses"
            :key="st.id"
            class="col"
            @dragover.prevent
            @drop.prevent="onDrop(activeListId, st.id, tasksBy(activeListId, st.id).length)"
          >
            <div class="colHeader">
              <span class="colTitle">{{ st.title }}</span>
              <span class="colCount">{{ tasksBy(activeListId, st.id).length }}</span>
            </div>

            <div class="colBody">
              <template v-for="(t, index) in tasksBy(activeListId, st.id)" :key="t.id">
                <div
                  class="dropZone"
                  @dragover.prevent
                  @drop.prevent="onDrop(activeListId, st.id, index)"
                />
                <div
                  class="card"
                  draggable="true"
                  @dragstart="onDragStart($event, t)"
                >
                  <div class="cardRow">
                    <div class="cardTitle">{{ t.title }}</div>
                    <div class="badge">•</div>
                  </div>
                  <div class="cardMeta">id: {{ t.id }} · pos: {{ t.position }}</div>
                </div>
              </template>

              <div
                class="dropZone"
                @dragover.prevent
                @drop.prevent="onDrop(activeListId, st.id, tasksBy(activeListId, st.id).length)"
              />
            </div>
          </div>
        </div>

        <!--        <div v-else class="empty">-->
        <!--          Maak eerst een list in deze space.-->
        <!--        </div>-->

      </main>
    </div>
  </div>

  <!-- MODAL (wireframe) -->
  <div v-if="isModalOpen" class="modalOverlay" @click.self="closeModal">
    <div class="modal">
      <div class="modalTabs">
        <button
          :class="{active: modalTab === 'task'}"
          class="modalTab"
          @click="modalTab = 'task'"
        >
          Create Task
        </button>
        <button
          :class="{active: modalTab === 'list'}"
          class="modalTab"
          @click="modalTab = 'list'"
        >
          Create List
        </button>

        <button
          :class="{active: modalTab === 'space'}"
          class="modalTab"
          @click="modalTab = 'space'"
        >
          Creat Space
        </button>

      </div>

      <!-- CREATE TASK -->
      <div v-if="modalTab === 'task'" class="modalBody">
        <label class="field">
          <span class="fieldLabel">Title...</span>
          <input v-model="taskForm.title" class="fieldInput" type="text"/>
        </label>

        <label class="field">
          <span class="fieldLabel">Description (optional)...</span>
          <textarea v-model="taskForm.description" class="fieldInput fieldTextArea" rows="3"></textarea>
        </label>

        <label class="field">
          <span class="fieldLabel">Status...</span>
          <select v-model="taskForm.statusId" class="fieldInput">
            <option v-for="st in statuses" :key="st.id" :value="st.id">
              {{ st.title }}
            </option>
          </select>
        </label>

        <label class="field">
          <span class="fieldLabel">List...</span>
          <select v-model="taskForm.listId" class="fieldInput">
            <option :value="null">— kies —</option>
            <option v-for="l in lists" :key="l.id" :value="l.id">
              {{ l.name }}
            </option>
          </select>
        </label>
      </div>

      <!-- CREATE LIST -->
      <div v-else-if="modalTab === 'list'" class="modalBody">
        <label class="field">
          <span class="fieldLabel">Title...</span>
          <input v-model="listForm.name" class="fieldInput" type="text"/>
        </label>
        <div class="hint">List wordt aangemaakt in: <b>{{ currentSpaceName }}</b></div>
      </div>

      <!-- CREATE SPACE -->
      <div v-else class="modalBody">
        <label class="field">
          <span class="fieldLabel">Title...</span>
          <input v-model="spaceForm.name" class="fieldInput" type="text"/>
        </label>

        <label class="field">
          <span class="fieldLabel">Description (optional)...</span>
          <textarea v-model="spaceForm.description" class="fieldInput fieldTextArea" rows="3"></textarea>
        </label>
      </div>


      <div class="modalFooter">
        <button :disabled="modalSaving" class="modalSave" @click="saveModal">
          Save
        </button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #1f2836;
  color: #e9eef7;
}

/* TOPBAR */
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

.topbarLeft {
  height: 64px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #1a2230;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 14px;
}

.topbarRight {
  height: 64px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 25px;
  background: #1a2230;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 14px;
}

.brand {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.3px;
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

.createBtn {
  height: 34px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #1e8e3e;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
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

/* BODY */
.body {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 18px;
  padding: 16px;
}

/* SIDEBAR */
.sidebar {
  background: #2a3446;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: calc(100vh - 96px);
  position: sticky;
  top: 80px;
}

.sidebarTitle {
  font-weight: 800;
  font-size: 16px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.18);
  margin-bottom: 12px;
}

.sidebarSection {
  margin-bottom: 14px;
}

.sidebarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(233, 238, 247, 0.8);
  font-size: 13px;
  margin: 10px 4px;
}

.menu {
  opacity: 0.7;
}

.sidebarItem {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.15);
  color: #e9eef7;
  cursor: pointer;
}

.sidebarItem.active {
  background: #f59e0b;
  color: #111827;
  font-weight: 800;
}

.spacesList, .listsBox {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spaceBtn, .listBtn {
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.12);
  color: #e9eef7;
  cursor: pointer;
}

.spaceBtn.active, .listBtn.active {
  background: #3b82f6;
  border-color: rgba(255, 255, 255, 0.12);
  font-weight: 800;
}

.dashBtn {
  width: 100%;
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
  color: #e9eef7;
  cursor: pointer;
}

.logoutBtn {
  width: 100%;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: #ef4444;
  color: white;
  font-weight: 800;
  cursor: pointer;
}

/* BOARD */
.board {
  background: #2a3446;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  min-height: calc(100vh - 96px);
}

.boardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.chips {
  display: flex;
  gap: 10px;
}

.chip {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.12);
  font-size: 12px;
  color: rgba(233, 238, 247, 0.9);
}

.boardTitle {
  padding: 6px 12px;
  border-radius: 999px;
  background: #f59e0b;
  color: #111827;
  font-weight: 900;
}

.loading, .empty {
  padding: 16px;
  color: rgba(233, 238, 247, 0.85);
}

.columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 14px;
}

.col {
  background: #1f2836;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
  min-height: 560px;
}

.colHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px;
  background: rgba(0, 0, 0, 0.18);
}

.colTitle {
  color: #f59e0b;
  font-weight: 900;
  font-size: 13px;
}

.colCount {
  font-size: 12px;
  opacity: 0.8;
}

.colBody {
  padding: 10px 10px 14px 10px;
}

.dropZone {
  height: 10px;
}

.card {
  background: #2b3550;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 12px;
  padding: 10px;
  margin: 8px 0;
  cursor: grab;
}

.cardRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cardTitle {
  font-weight: 800;
  font-size: 13px;
}

.badge {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #f59e0b;
  opacity: 0.9;
}

.cardMeta {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.75;
}

/* responsive */
@media (max-width: 1100px) {
  .body {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
  }

  .columns {
    grid-template-columns: 1fr;
  }
}

.createListBtn {
  height: 34px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.12);
  color: #e9eef7;
  font-weight: 700;
  cursor: pointer;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 16px;
}

.modal {
  width: min(520px, 100%);
  background: #ffffff;
  color: #111827;
  border-radius: 12px;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.modalTabs {
  display: flex;
  gap: 8px;
  padding: 12px 12px 0 12px;
}

.modalTab {
  border: 1px solid rgba(17, 24, 39, 0.25);
  background: #fff;
  color: #111827;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.modalTab.active {
  background: #dbeafe;
  border-color: rgba(59, 130, 246, 0.6);
}

.modalBody {
  padding: 14px 14px 6px 14px;
}

.field {
  display: grid;
  gap: 6px;
  margin: 10px 0;
}

.fieldLabel {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.65);
}

.fieldInput {
  width: 100%;
  border: 0;
  border-bottom: 2px solid rgba(17, 24, 39, 0.35);
  padding: 8px 6px;
  outline: none;
  font-size: 13px;
  background: transparent;
}

.fieldInput:focus {
  border-bottom-color: rgba(59, 130, 246, 0.9);
}

.fieldTextArea {
  resize: vertical;
  min-height: 70px;
}

.hint {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.65);
  padding: 8px 2px 2px 2px;
}

.modalFooter {
  padding: 12px 14px 14px 14px;
  display: flex;
  justify-content: flex-start;
}

.modalSave {
  min-width: 90px;
  height: 32px;
  padding: 0 14px;
  border-radius: 2px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: #dbeafe;
  color: #111827;
  cursor: pointer;
  font-weight: 700;
}

.modalSave:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>
