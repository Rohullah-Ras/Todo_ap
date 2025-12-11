<template>
  <v-container class="py-8" max-width="1200">
    <h1 class="text-h4 mb-6">Task Manager</h1>

    <v-alert
      v-if="error"
      class="mb-4"
      color="red-darken-3"
      variant="tonal"
    >
      <pre style="white-space: pre-line; margin: 0;">{{ error }}</pre>
    </v-alert>

    <v-card class="mb-6">
      <v-card-title>Add a new task</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="addTask">
          <v-text-field
            v-model="newTaskTitle"
            class="mb-3"
            label="Title"
            required
          />

          <v-textarea
            v-model="newTaskDescription"
            auto-grow
            class="mb-3"
            label="Description (optional)"
          />

          <!-- Status select from backend statuses -->
          <v-select
            v-model="newTaskStatusId"
            :disabled="statuses.length === 0"
            :items="statusOptions"
            class="mb-3"
            item-title="label"
            item-value="value"
            label="Status"
          />

          <v-select
            v-model="addTaskListKey"
            :disabled="!listsLoaded || listOptions.length === 0"
            :items="listOptions"
            class="mb-3"
            item-title="label"
            item-value="value"
            label="List / Column"
          />

          <v-text-field
            v-model="newListTitle"
            class="mb-4"
            hint="e.g. Vakantie"
            label="Or create new list"
            persistent-hint
          />

          <v-btn
            :disabled="!newTaskTitle.trim() || !listsLoaded"
            color="primary"
            type="submit"
          >
            Add Task
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5">Board</h2>

      <div class="d-flex align-center" style="gap: 12px;">
        <v-select
          v-model="selectedStatusFilter"
          :items="statusFilterOptions"
          density="compact"
          hide-details
          item-title="label"
          item-value="value"
          label="Show status"
          style="max-width: 200px;"
        />

        <v-select
          v-model="selectedListFilter"
          :items="listFilterOptions"
          density="compact"
          hide-details
          item-title="label"
          item-value="value"
          label="List"
          style="max-width: 220px;"
        />

        <span v-if="loading" class="text-body-2">Loading...</span>
      </div>
    </div>

    <v-card v-if="!hasAnyTasks && !loading">
      <v-card-text class="text-medium-emphasis">
        No tasks yet. Add one above ✏️
      </v-card-text>
    </v-card>

    <v-row v-else dense>
      <v-col
        v-for="list in visibleLists"
        :key="list.id"
        cols="12"
        md="4"
      >
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center" style="gap: 6px;">
            <h3
              v-if="!list.editing"
              class="text-h6 mb-0"
            >
              {{ list.title }}
            </h3>

            <v-text-field
              v-else
              v-model="list.editTitle"
              density="compact"
              hide-details
              style="max-width: 170px;"
            />
          </div>

          <div class="d-flex align-center" style="gap: 4px;">
                <span class="text-caption text-medium-emphasis mr-1">
                  {{ (columns[list.key] || []).length }} task(s)
                </span>

            <template v-if="!list.editing">
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="startEditList(list)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>

              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="deleteList(list)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>

            <template v-else>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="saveEditList(list)"
              >
                <v-icon>mdi-check</v-icon>
              </v-btn>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="cancelEditList(list)"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </div>
        </div>

        <draggable
          v-model="columns[list.key]"
          :data-list-key="list.key"
          group="tasks"
          item-key="id"
          @end="onDragEnd"
        >
          <template #item="{ element: task }">
            <div v-show="matchesStatusFilter(task)">
              <v-card class="mb-2">
                <v-card-text class="d-flex flex-column gap-2">
                  <div class="d-flex align-start justify-space-between">
                    <div class="d-flex align-start">
                      <v-checkbox
                        v-model="task.isDone"
                        class="mr-2 mt-0 pt-0"
                        hide-details
                        @change="toggleDone(task)"
                      />

                      <div>
                        <div v-if="task.editing">
                          <v-text-field
                            v-model="task.editTitle"
                            class="mb-2"
                            density="compact"
                            label="Title"
                          />
                          <v-textarea
                            v-model="task.editDescription"
                            auto-grow
                            class="mb-2"
                            density="compact"
                            label="Description"
                          />

                          <v-btn
                            class="mr-2"
                            color="primary"
                            size="small"
                            @click="saveEdit(task)"
                          >
                            Save
                          </v-btn>
                          <v-btn
                            size="small"
                            variant="text"
                            @click="cancelEdit(task)"
                          >
                            Cancel
                          </v-btn>
                        </div>

                        <div v-else>
                          <div
                            :class="task.isDone ? 'text-decoration-line-through' : ''"
                            class="text-subtitle-1 font-weight-medium"
                          >
                            {{ task.title }}
                          </div>

                          <div
                            v-if="task.description"
                            :class="task.isDone ? 'text-decoration-line-through' : ''"
                            class="text-body-2 text-medium-emphasis"
                          >
                            {{ task.description }}
                          </div>

                          <v-chip
                            :color="
                                  task.statusName === 'done'
                                    ? 'green-darken-1'
                                    : task.statusName === 'in-progress'
                                      ? 'blue-darken-1'
                                      : 'grey-darken-1'
                                "
                            class="mt-1"
                            size="x-small"
                            text-color="white"
                          >
                            {{
                              task.statusName === 'done'
                                ? 'Done'
                                : task.statusName === 'in-progress'
                                  ? 'In progress'
                                  : 'To do'
                            }}
                          </v-chip>
                        </div>
                      </div>
                    </div>

                    <div class="d-flex flex-column align-end">
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        @click="startEdit(task)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>

                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        @click="deleteTask(task.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <div class="text-caption text-medium-emphasis">
                    Created: {{ new Date(task.createdAt).toLocaleString() }}
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </template>
        </draggable>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'

const API_BASE = 'http://localhost:3005/api'
const TASKS_URL = `${API_BASE}/tasks`
const LISTS_URL = `${API_BASE}/lists`
const STATUSES_URL = `${API_BASE}/statuses`

const lists = ref([])
const listsById = ref({})
const listsByKey = ref({})
const columns = ref({})

const statuses = ref([])

const loading = ref(false)
const error = ref('')
const listsLoaded = ref(false)

const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskStatusId = ref(null)
const addTaskListKey = ref(null)
const newListTitle = ref('')

// status options built from backend
const statusOptions = computed(() =>
  statuses.value.map((s) => ({
    label:
      s.name === 'todo'
        ? 'To do'
        : s.name === 'in-progress'
          ? 'In progress'
          : 'Done',
    value: s.id,
  })),
)

const SYSTEM_LIST_KEYS = ['todo', 'in-progress', 'done']

const selectedStatusFilter = ref('all')

const userLists = computed(() =>
  lists.value.filter((l) => !SYSTEM_LIST_KEYS.includes(l.key)),
)

const listFilterOptions = computed(() => [
  {label: 'All lists', value: 'all'},
  ...userLists.value.map((l) => ({
    label: l.title,
    value: l.key,
  })),
])

const selectedListFilter = ref('all')

const visibleLists = computed(() =>
  selectedListFilter.value === 'all'
    ? userLists.value
    : userLists.value.filter((l) => l.key === selectedListFilter.value),
)

const listOptions = computed(() =>
  userLists.value.map((l) => ({
    label: l.title,
    value: l.key,
  })),
)

const statusFilterOptions = computed(() => [
  {label: 'All statuses', value: 'all'},
  ...statuses.value.map((s) => ({
    label:
      s.name === 'todo'
        ? 'To do'
        : s.name === 'in-progress'
          ? 'In progress'
          : 'Done',
    value: s.name,
  })),
])

const hasAnyTasks = computed(() =>
  Object.values(columns.value).some((col) => (col || []).length > 0),
)

function enhanceList(l) {
  const title = l.title ?? l.name ?? ''
  return {
    ...l,
    title,
    editing: false,
    editTitle: title,
  }
}

function enhanceTask(t) {
  const statusName = t.status?.name ?? t.statusName ?? 'todo'
  const statusId = t.status?.id ?? t.statusId ?? null

  return {
    ...t,
    editing: false,
    editTitle: t.title,
    editDescription: t.description ?? '',
    statusName,
    statusId,
  }
}

function getErrorMessage(err, fallback) {
  if (err?.response?.data) {
    const data = err.response.data
    if (Array.isArray(data.message)) return data.message.join('\n')
    if (typeof data.message === 'string') return data.message
  }
  return fallback
}

function findTaskLocation(taskId) {
  for (const key of Object.keys(columns.value)) {
    const idx = columns.value[key].findIndex((t) => t.id === taskId)
    if (idx !== -1) return {key, idx}
  }
  return null
}

function matchesStatusFilter(task) {
  const filter = selectedStatusFilter.value
  if (filter === 'all') return true
  return task.statusName === filter
}

async function loadStatuses() {
  try {
    const res = await axios.get(STATUSES_URL)
    statuses.value = res.data

    // default for new tasks: first status or 'todo'
    if (!newTaskStatusId.value && statuses.value.length > 0) {
      const todo = statuses.value.find((s) => s.name === 'todo')
      newTaskStatusId.value = todo ? todo.id : statuses.value[0].id
    }
  } catch (err) {
    console.error('Error loading statuses', err)
    error.value = getErrorMessage(err, 'Could not load statuses.')
  }
}

async function loadBoard() {
  loading.value = true
  error.value = ''
  try {
    const listsRes = await axios.get(LISTS_URL)
    lists.value = listsRes.data.map(enhanceList)


    // reset maps and columns
    listsById.value = {}
    listsByKey.value = {}
    columns.value = {}

    for (const l of lists.value) {
      listsById.value[l.id] = l
      listsByKey.value[l.key] = l
      if (!columns.value[l.key]) columns.value[l.key] = []
    }

    listsLoaded.value = true

    const tasksRes = await axios.get(TASKS_URL)
    const tasks = tasksRes.data


    // clear all columns
    for (const key of Object.keys(columns.value)) {
      columns.value[key] = []
    }

    for (const t of tasks) {
      const enhanced = enhanceTask(t)

      // find list key: prefer relation, fallback to listsById
      const listKey =
        t.list?.key ?? listsById.value[t.listId]?.key ?? 'todo'

      console.log(
        'Place task',
        enhanced.id,
        'title:',
        enhanced.title,
        'listId:',
        t.listId,
        '=> listKey:',
        listKey,
      )

      if (!columns.value[listKey]) columns.value[listKey] = []
      columns.value[listKey].push(enhanced)
    }

    if (!addTaskListKey.value && userLists.value.length > 0) {
      addTaskListKey.value = userLists.value[0].key
    }
  } catch (err) {
    console.error('Error loading board', err)
    error.value = getErrorMessage(err, 'Could not load board data.')
  } finally {
    loading.value = false
  }
}


function getStatusIdByName(name) {
  return statuses.value.find((s) => s.name === name)?.id ?? null
}

async function toggleDone(task) {
  error.value = ''
  try {
    const newIsDone = task.isDone
    const newStatusName = newIsDone ? 'done' : 'todo'
    const newStatusId = getStatusIdByName(newStatusName)

    const res = await axios.patch(`${TASKS_URL}/${task.id}`, {
      isDone: newIsDone,
      statusId: newStatusId ?? task.statusId,
    })

    const updated = enhanceTask(res.data)
    const loc = findTaskLocation(task.id)
    if (loc) columns.value[loc.key][loc.idx] = updated
  } catch (err) {
    console.error('Error updating task', err)
    error.value = getErrorMessage(err, 'Could not update task.')
  }
}

function startEdit(task) {
  task.editing = true
  task.editTitle = task.title
  task.editDescription = task.description ?? ''
}

function cancelEdit(task) {
  task.editing = false
  task.editTitle = task.title
  task.editDescription = task.description ?? ''
}

async function saveEdit(task) {
  error.value = ''
  try {
    const res = await axios.patch(`${TASKS_URL}/${task.id}`, {
      title: task.editTitle,
      description: task.editDescription || undefined,
    })

    const updated = enhanceTask(res.data)
    const loc = findTaskLocation(task.id)
    if (loc) {
      columns.value[loc.key].splice(loc.idx, 1, updated)
    }
  } catch (err) {
    console.error('Error saving task', err)
    error.value = getErrorMessage(err, 'Could not save task.')
  } finally {
    task.editing = false
  }
}

async function addTask() {
  console.log('addTask CALLED')
  console.log('newTaskTitle:', newTaskTitle.value)
  console.log('listsLoaded:', listsLoaded.value)
  console.log('newTaskStatusId:', newTaskStatusId.value)

  // 1. Titel check
  if (!newTaskTitle.value.trim()) {
    error.value = 'Titel is verplicht.'
    return
  }

  // 2. Lijsten moeten geladen zijn
  if (!listsLoaded.value) {
    error.value = 'Lijsten zijn nog niet geladen. Ververs de pagina of controleer de backend (/api/lists).'
    return
  }

  // 3. Status moet gekozen zijn
  if (!newTaskStatusId.value) {
    if (statuses.value.length > 0) {
      // fallback: eerste status gebruiken
      newTaskStatusId.value = statuses.value[0].id
    } else {
      error.value = 'Geen statussen beschikbaar. /api/statuses geeft waarschijnlijk niets terug.'
      return
    }
  }

  error.value = ''

  let finalListKey = addTaskListKey.value
  console.log('init finalListKey:', finalListKey, 'newListTitle:', newListTitle.value)

  // 4. Als er nog geen lijst is gekozen en je hebt geen nieuwe lijstnaam ingevuld
  if (!finalListKey && !newListTitle.value.trim()) {
    error.value = 'Kies een lijst of vul een nieuwe lijst in bij "Or create new list".'
    return
  }

  try {
    // eventueel nieuwe lijst aanmaken
    if (newListTitle.value.trim()) {
      const listRes = await axios.post(LISTS_URL, {
        name: newListTitle.value.trim(),
      })
      console.log('created list res:', listRes.data)

      const newListRaw = listRes.data
      const newList = enhanceList(newListRaw)

      lists.value.push(newList)
      listsById.value[newList.id] = newList
      listsByKey.value[newList.key] = newList
      if (!columns.value[newList.key]) columns.value[newList.key] = []

      finalListKey = newList.key
      newListTitle.value = ''

      if (!addTaskListKey.value) addTaskListKey.value = finalListKey
    }

    console.log('final finalListKey:', finalListKey)
    const chosenList = listsByKey.value[finalListKey]
    console.log('chosenList:', chosenList)

    if (!chosenList) {
      error.value = 'Interne fout: lijst niet gevonden. (Unknown list)'
      return
    }

    const payload = {
      title: newTaskTitle.value,
      description: newTaskDescription.value || undefined,
      listId: chosenList.id,
      statusId: newTaskStatusId.value,
    }
    console.log('POST task payload:', payload)

    const res = await axios.post(TASKS_URL, payload)
    console.log('created task res:', res.data)

    const task = enhanceTask(res.data)

    if (!columns.value[finalListKey]) columns.value[finalListKey] = []
    columns.value[finalListKey].unshift(task)

    newTaskTitle.value = ''
    newTaskDescription.value = ''
    addTaskListKey.value = finalListKey
  } catch (err) {
    console.error('Error adding task', err)
    error.value = getErrorMessage(err, 'Could not add task.')
  }
}


async function onDragEnd(evt) {
  const newKey = evt.to?.dataset?.listKey
  const oldKey = evt.from?.dataset?.listKey

  console.log('onDragEnd', {newKey, oldKey, evt})
  if (!newKey || !oldKey) {
    console.warn('Missing listKey on drag', {newKey, oldKey})
    return
  }
  const newCol = columns.value[newKey] || []
  const movedTask = newCol[evt.newIndex]
  if (!movedTask) {
    console.warn('No movedTask found at newIndex', evt.newIndex)
    return
  }

  const list = listsByKey.value[newKey]
  if (!list) {
    console.warn('No list found for key', newKey)
    return
  }


  const rawId = movedTask.id
  const taskId = Number(rawId)

  console.log('movedTask.id RAW:', rawId, '=> Number:', taskId)

  if (!rawId && rawId !== 0) {
    console.warn('Task has no id, cannot PATCH', movedTask)
    return
  }

  if (Number.isNaN(taskId)) {
    console.warn('Task id is not a valid number, cannot PATCH', rawId)
    return
  }


  const payload = {
    listId: list.id,
    isDone: movedTask.isDone,
  }

  console.log('PATCH move payload', payload)

  try {
    await axios.patch(`${TASKS_URL}/${taskId}`, payload)
    // Optional: could read response and sync, but not required for listId.
  } catch (err) {
    console.error('Error moving task', err)
    error.value = getErrorMessage(err, 'Could not move task.')

    newCol.splice(evt.newIndex, 1)
    if (!columns.value[oldKey]) columns.value[oldKey] = []
    columns.value[oldKey].splice(evt.oldIndex, 0, movedTask)
  }
}

function startEditList(list) {
  list.editing = true
  list.editTitle = list.title
}

function cancelEditList(list) {
  list.editing = false
  list.editTitle = list.title
}

async function saveEditList(list) {
  error.value = ''
  try {
    const res = await axios.patch(`${LISTS_URL}/${list.id}`, {
      name: list.editTitle,
    })
    const updated = enhanceList(res.data)

    list.title = updated.title
    list.editTitle = updated.editTitle
    list.editing = false
  } catch (err) {
    console.error('Error renaming list', err)
    error.value = getErrorMessage(err, 'Could not rename list.')
  }
}

async function deleteList(list) {
  error.value = ''
  try {
    await axios.delete(`${LISTS_URL}/${list.id}`)

    lists.value = lists.value.filter((l) => l.id !== list.id)
    delete listsById.value[list.id]
    delete listsByKey.value[list.key]
    delete columns.value[list.key]

    if (selectedListFilter.value === list.key) {
      selectedListFilter.value = 'all'
    }
    if (addTaskListKey.value === list.key) {
      addTaskListKey.value =
        userLists.value.length > 0 ? userLists.value[0].key : null
    }
  } catch (err) {
    console.error('Error deleting list', err)
    error.value = getErrorMessage(err, 'Could not delete list.')
  }
}

onMounted(async () => {
  await Promise.all([loadStatuses(), loadBoard()])
})
</script>

<style scoped>
.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
