<template>
  <section class="spacesPage">
    <div class="spacesHeader">
      <h1>Your Spaces</h1>
      <button class="addBtn" @click="openAdd">Add Space +</button>
    </div>

    <div v-if="loading" class="empty">Loading spaces...</div>
    <div v-else-if="!spaces.length" class="empty">No spaces for this user.</div>

    <div v-for="s in spaces" :key="s.id" class="spaceRow">
      <div class="name">{{ s.name }}</div>
      <div class="date">Created at {{ format(s.createdAt) }}</div>
      <div class="actions">
        <button @click="edit(s)">Edit</button>
        <button @click="remove(s)">Delete</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {api} from '@/api/http'

const spaces = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await api.get('/spaces')
    spaces.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openAdd() {
}

async function edit(s) {
  const next = prompt('Nieuwe naam voor de space:', s.name)
  if (!next || next.trim() === s.name) return
  await api.patch(`/spaces/${s.id}`, {name: next.trim()})
  await load()
}

async function remove(s) {
  if (!confirm(`Space "${s.name}" verwijderen?`)) return
  await api.delete(`/spaces/${s.id}`)
  spaces.value = spaces.value.filter(item => item.id !== s.id)
}

function format(d) {
  return new Date(d).toLocaleString()
}
</script>

<style scoped>
.spacesPage {
  display: grid;
  gap: 12px;
}

.spacesHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.addBtn {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(59, 130, 246, 0.25);
  color: #e9eef7;
  font-weight: 800;
  cursor: pointer;
}

.spaceRow {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
}

.name {
  font-weight: 800;
}

.date {
  font-size: 12px;
  opacity: 0.75;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.18);
  color: #e9eef7;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-weight: 700;
}

.empty {
  opacity: 0.8;
}
</style>
