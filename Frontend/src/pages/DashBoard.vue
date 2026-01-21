<template>
  <v-container class="board-shell" fluid>
    <div class="board-grid">
      <!-- LEFT SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-title">School Space</div>

        <div class="nav">
          <div :class="{active: activeTab==='recent'}" class="nav-item" @click="activeTab='recent'">
            <span>Recent</span>
            <v-icon size="18">mdi-format-list-bulleted</v-icon>
          </div>
          <div :class="{active: activeTab==='all'}" class="nav-item" @click="activeTab='all'">
            <span>All</span>
            <v-icon size="18">mdi-format-list-bulleted</v-icon>
          </div>
          <div :class="{active: activeTab==='lists'}" class="nav-item" @click="activeTab='lists'">
            <span>Lists</span>
            <v-icon size="18">mdi-format-list-bulleted</v-icon>
          </div>
        </div>

        <div class="sidebar-bottom">
          <v-btn block class="dash" variant="tonal" @click="reload">Dashboard</v-btn>
          <v-btn block class="logout" color="red-lighten-1" variant="flat" @click="logout">Logout</v-btn>
        </div>
      </aside>

      <!-- MAIN -->
      <section class="main">
        <div class="top-row">
          <div class="avatars">
            <div class="avatar a1">RR</div>
            <div class="avatar a2">AL</div>
          </div>

          <v-select
            v-model="selectedSpace"
            :items="spaceOptions"
            class="mini-select"
            density="compact"
            hide-details
            label="Space"
            variant="solo"
          />
          <v-select
            v-model="selectedProject"
            :items="projectOptions"
            class="mini-select"
            density="compact"
            hide-details
            label="Project"
            variant="solo"
          />
          <v-select
            v-model="selectedType"
            :items="typeOptions"
            class="mini-select"
            density="compact"
            hide-details
            label="Type"
            variant="solo"
          />

          <v-btn class="pill" color="amber-darken-1" variant="flat">
            Project DB
          </v-btn>

          <v-spacer/>

          <div class="status">
            <span v-if="loading">Loading...</span>
            <span v-if="error" class="err">{{ error }}</span>
          </div>
        </div>

        <div class="columns">
          <BoardColumn
            :count="(columns.todo || []).length"
            :tasks="columns.todo || []"
            list-key="todo"
            title="TO DO"
            @delete="deleteTask"
            @edit="editTask"
            @move="onMove"
            @toggleDone="toggleDone"
          />
          <BoardColumn
            :count="(columns['in-progress'] || []).length"
            :tasks="columns['in-progress'] || []"
            list-key="in-progress"
            title="IN PROGRESS"
            @delete="deleteTask"
            @edit="editTask"
            @move="onMove"
            @toggleDone="toggleDone"
          />
          <BoardColumn
            :count="(columns.done || []).length"
            :tasks="columns.done || []"
            list-key="done"
            title="DONE"
            @delete="deleteTask"
            @edit="editTask"
            @move="onMove"
            @toggleDone="toggleDone"
          />
        </div>
      </section>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import BoardColumn from '@/components/board/BoardColumn.vue'
import {http} from '@/api/http'
import {useAuthStore} from '@/stores/auth'

type Status = { id: number; name: 'todo' | 'in-progress' | 'done' }
type List = { id: number; key: string; title?: string; name?: string }
type Task = {
  id: number
  title: string
  description?: string | null
  isDone: boolean
  createdAt: string
  statusId?: number | null
  status?: { id: number; name: string }
  listId?: number | null
  list?: { id: number; key: string }
}

const auth = useAuthStore()

const loading = ref(false)
const error = ref('')

const statuses = ref<Status[]>([])
const lists = ref<List[]>([])

const columns = reactive<Record<string, Task[]>>({
  todo: [],
  'in-progress': [],
  done: [],
})

const activeTab = ref<'recent' | 'all' | 'lists'>('recent')

// dummy UI selects (kun je later koppelen)
const selectedSpace = ref('School')
const selectedProject = ref('Project')
const selectedType = ref('Task')
const spaceOptions = ['School', 'Work', 'Personal']
const projectOptions = ['Project', 'Project DB']
const typeOptions = ['Task', 'Bug', 'Feature']

function normalizeTask(t: Task) {
  const statusName = t.status?.name ?? 'todo'
  const listKey = t.list?.key ?? 'todo'
  return {...t, statusName, listKey}
}

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [sRes, lRes, tRes] = await Promise.all([
      http.get('/statuses'),
      http.get('/lists'),
      http.get('/tasks'),
    ])

    statuses.value = sRes.data
    lists.value = lRes.data

    // reset columns
    columns.todo = []
    columns['in-progress'] = []
    columns.done = []

    const tasks: Task[] = tRes.data
    for (const raw of tasks) {
      const t = normalizeTask(raw) as any
      const key = (t.listKey === 'in-progress' || t.listKey === 'done') ? t.listKey : 'todo'
      columns[key].push(raw)
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join('\n') : (msg ?? 'Could not load board.')
  } finally {
    loading.value = false
  }
}

function statusIdByName(name: string) {
  return statuses.value.find(s => s.name === name)?.id ?? null
}

// Drag move handler (blijft veilig + rollback in column component)
async function onMove(payload: { taskId: number; toKey: string }) {
  const listKey = payload.toKey
  // Als jij listId gebruikt per kolom, kun je hier je “system lists” mappen naar echte listId
  const statusName =
    listKey === 'done' ? 'done' :
      listKey === 'in-progress' ? 'in-progress' :
        'todo'

  const newStatusId = statusIdByName(statusName)

  // PATCH task → alleen noodzakelijke velden
  await http.patch(`/tasks/${payload.taskId}`, {
    statusId: newStatusId,
  })
}

async function toggleDone(task: Task) {
  error.value = ''
  try {
    const newStatus = task.isDone ? 'done' : 'todo'
    await http.patch(`/tasks/${task.id}`, {
      isDone: task.isDone,
      statusId: statusIdByName(newStatus),
    })
  } catch (e: any) {
    const msg = e?.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join('\n') : (msg ?? 'Could not update task.')
  }
}

function editTask(_task: Task) {
  // later: open dialog
}

async function deleteTask(taskId: number) {
  error.value = ''
  try {
    await http.delete(`/tasks/${taskId}`)
    // lokaal verwijderen
    for (const k of Object.keys(columns)) {
      const idx = columns[k].findIndex(t => t.id === taskId)
      if (idx !== -1) columns[k].splice(idx, 1)
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join('\n') : (msg ?? 'Could not delete task.')
  }
}

async function reload() {
  await loadAll()
}

async function logout() {
  await auth.logout()
  window.location.href = '/auth/sign-in'
}

onMounted(loadAll)
</script>

<style scoped>
.board-shell {
  padding: 18px;
}

.board-grid {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 18px;
  max-width: 1200px;
  margin: 0 auto;
}

.sidebar {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 16px;
  color: #e8eefc;
  display: flex;
  flex-direction: column;
  min-height: 560px;
}

.sidebar-title {
  font-weight: 800;
  padding: 10px 10px 14px;
  opacity: 0.95;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 6px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.10);
}

.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dash {
  border-radius: 12px;
  text-transform: none;
}

.logout {
  border-radius: 12px;
  text-transform: none;
}

.main {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 16px;
  color: #e8eefc;
  min-height: 560px;
}

.top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 14px;
}

.avatars {
  display: flex;
  gap: 8px;
  margin-right: 6px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.a1 {
  background: #f6b11a;
  color: #1b1f2a;
}

.a2 {
  background: #46d39a;
  color: #1b1f2a;
}

.mini-select {
  width: 140px;
}

.mini-select :deep(.v-field) {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.mini-select :deep(input) {
  color: #e8eefc;
}

.pill {
  border-radius: 999px;
  text-transform: none;
  font-weight: 800;
}

.columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.status {
  font-size: 12px;
  opacity: 0.85;
}

.err {
  color: #ffb4b4;
}

@media (max-width: 1100px) {
  .board-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    min-height: auto;
  }

  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
