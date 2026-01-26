<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {api} from '@/api/http'

const route = useRoute()
const router = useRouter()

const spaceId = ref(Number(route.params.spaceId) || 0)

const spaces = ref([])
const lists = ref([])
const tasks = ref([])

const search = ref('')
const selectedListId = ref(null) // filter: null = all
const loading = ref(false)

// status IDs moeten matchen met jouw DB
const statuses = [
  {id: 1, title: 'TO DO'},
  {id: 2, title: 'IN PROGRESS'},
  {id: 3, title: 'DONE'},
]

// drag state
const dragging = ref(null) // { taskId }

const logout = () => {
  localStorage.removeItem('access_token')
  router.push('/login')
}

const loadSpaces = async () => {
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

const currentSpaceName = computed(() => {
  const s = spaces.value.find(x => x.id === spaceId.value)
  return s?.name ?? 'Space'
})

const filteredLists = computed(() => lists.value)

const visibleTasks = computed(() => {
  let t = tasks.value

  if (selectedListId.value) {
    t = t.filter(x => x.listId === selectedListId.value)
  }

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    t = t.filter(x => (x.title || '').toLowerCase().includes(q))
  }

  return t
})

const tasksBy = (listId, statusId) => {
  return visibleTasks.value
    .filter(t => t.listId === listId && t.statusId === statusId)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

const onDragStart = (ev, task) => {
  ev.dataTransfer.setData('text/plain', String(task.id))
  ev.dataTransfer.effectAllowed = 'move'
  dragging.value = {taskId: task.id}
}

const onDrop = async (toListId, toStatusId, toIndex) => {
  if (!dragging.value) return
  const taskId = dragging.value.taskId
  dragging.value = null

  const draggedTask = tasks.value.find(t => t.id === taskId)
  if (!draggedTask) return

  let newPosition = toIndex

  const sameColumn =
    draggedTask.listId === toListId &&
    draggedTask.statusId === toStatusId

  // fix: reorder within same column
  if (sameColumn) {
    if (toIndex > (draggedTask.position ?? 0)) {
      newPosition = toIndex - 1
    }
  }

  await api.patch(`/tasks/${taskId}/move`, {
    listId: toListId,
    statusId: toStatusId,
    position: newPosition,
  })

  await loadBoard()
}

const openSpace = async (id) => {
  spaceId.value = id
  selectedListId.value = null
  await router.push(`/board/${id}`)
  await loadBoard()
}

// UI helper: choose which list is active for the board (wireframe shows one list highlighted)
const activeList = computed(() => {
  if (selectedListId.value) return lists.value.find(l => l.id === selectedListId.value)
  return lists.value[0] ?? null
})

const activeListId = computed(() => activeList.value?.id ?? null)

const createTask = async () => {
  // simpele create: maakt task in actieve list met status todo
  if (!activeListId.value) return alert('Maak eerst een list')
  const title = prompt('Task title?')
  if (!title) return

  await api.post('/tasks', {title, listId: activeListId.value})
  await loadBoard()
}
</script>

<template>
  <div class="page">
    <!-- TOPBAR -->
    <header class="topbar">
      <div class="brand">Task Manager</div>

      <div class="search">
        <input v-model="search" class="searchInput" placeholder="Search"/>
      </div>

      <button class="createBtn" @click="createTask">Creat Task</button>

      <nav class="topLinks">
        <a class="topLink" href="#">Link four</a>
        <a class="topLink" href="#">Link three</a>
      </nav>

      <div class="topIcons">
        <button class="iconBtn" title="Help">?</button>
        <button class="iconBtn" title="Settings">⚙</button>
        <button class="iconBtn" title="Account">👤</button>
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

        <div v-else class="empty">
          Maak eerst een list in deze space.
        </div>

      </main>
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
  align-items: center;
  padding: 0 18px;
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
</style>
