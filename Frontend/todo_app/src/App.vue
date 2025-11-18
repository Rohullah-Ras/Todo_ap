<template>
  <v-app>
    <v-main>
      <v-container class="py-8" max-width="700">
        <h1 class="text-h4 mb-6">Tasks</h1>

        <!-- Error display -->
        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <!-- Add Task -->
        <v-form @submit.prevent="addTask" class="mb-6">
          <v-text-field
            v-model="newTaskTitle"
            label="Task title"
            variant="outlined"
            class="mb-3"
            required
          />
          <v-textarea
            v-model="newTaskDescription"
            label="Description (optional)"
            variant="outlined"
            auto-grow
            class="mb-3"
          />
          <v-btn type="submit">
            Add Task
          </v-btn>
        </v-form>

        <v-divider class="mb-4" />

        <!-- Task List -->
        <div v-if="loading">Loading...</div>

        <div v-else>
          <div v-if="tasks.length === 0">
            No tasks yet.
          </div>

          <v-list v-else>
            <v-list-item
              v-for="task in tasks"
              :key="task.id"
              class="mb-2"
            >
              <template #prepend>
                <v-checkbox
                  v-model="task.isDone"
                  hide-details
                  @change="toggleDone(task)"
                />
              </template>

              <v-list-item-title
                v-if="!task.editing"
                :class="{ 'text-decoration-line-through': task.isDone }"
              >
                {{ task.title }}
              </v-list-item-title>

              <!-- Edit mode for title -->
              <v-text-field
                v-else
                v-model="task.editTitle"
                label="Edit title"
                density="compact"
                class="mb-1"
              />

              <v-list-item-subtitle v-if="!task.editing && task.description">
                {{ task.description }}
              </v-list-item-subtitle>

              <!-- Edit mode for description -->
              <v-textarea
                v-else-if="task.editing"
                v-model="task.editDescription"
                label="Edit description"
                auto-grow
                density="compact"
              />

              <template #append>
                <!-- Edit / Save button -->
                <v-btn
                  icon
                  @click="task.editing ? saveEdit(task) : startEdit(task)"
                  class="mr-2"
                >
                  <span v-if="!task.editing">✏️</span>
                  <span v-else>💾</span>
                </v-btn>

                <!-- Delete button -->
                <v-btn icon @click="deleteTask(task.id)">
                  🗑️
                </v-btn>


              </template>

            </v-list-item>
          </v-list>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// match your Nest URLs:
const API_URL = 'http://localhost:3001/api/tasks';

const tasks = ref([]);
const loading = ref(false);
const error = ref('');

const newTaskTitle = ref('');
const newTaskDescription = ref('');

function enhanceTask(raw) {
  return {
    ...raw,
    editing: false,
    editTitle: raw.title,
    editDescription: raw.description ?? '',
  };
}

async function fetchTasks() {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.get(API_URL);
    tasks.value = res.data.map(enhanceTask);
  } catch (err) {
    console.error('Error loading tasks', err);
    error.value = 'Could not load tasks from backend.';
  } finally {
    loading.value = false;
  }
}

async function addTask() {
  if (!newTaskTitle.value.trim()) return;
  error.value = '';

  try {
    const res = await axios.post(API_URL, {
      title: newTaskTitle.value,
      description: newTaskDescription.value || undefined,
    });

    tasks.value.push(enhanceTask(res.data));
    newTaskTitle.value = '';
    newTaskDescription.value = '';
  } catch (err) {
    console.error('Error adding task', err);
    error.value = 'Could not add task.';
  }
}

async function toggleDone(task) {
  error.value = '';
  try {
    const res = await axios.patch(`${API_URL}/${task.id}`, {
      isDone: task.isDone,
    });

    const index = tasks.value.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks.value[index] = enhanceTask(res.data);
    }
  } catch (err) {
    console.error('Error updating task', err);
    error.value = 'Could not update task.';
  }
}

function startEdit(task) {
  task.editing = true;
  task.editTitle = task.title;
  task.editDescription = task.description || '';
}

async function saveEdit(task) {
  error.value = '';
  try {
    const res = await axios.patch(`${API_URL}/${task.id}`, {
      title: task.editTitle,
      description: task.editDescription || undefined,
    });

    const index = tasks.value.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks.value[index] = enhanceTask(res.data);
    }
  } catch (err) {
    console.error('Error saving task', err);
    error.value = 'Could not save task.';
  } finally {
    task.editing = false;
  }
}

async function deleteTask(id) {
  error.value = '';
  try {
    await axios.delete(`${API_URL}/${id}`);
    tasks.value = tasks.value.filter((t) => t.id !== id);
  } catch (err) {
    console.error('Error deleting task', err);
    error.value = 'Could not delete task.';
  }
}

onMounted(() => {
  fetchTasks();
});
</script>

<style scoped>
.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
