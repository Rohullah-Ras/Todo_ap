<template>
  <section class="listsPage">
    <div class="listsHeader">
      <h1 class="title">Your Lists</h1>
      <button class="addBtn" @click="openAdd">Add List +</button>
    </div>

    <div v-if="loading" class="empty">Loading lists...</div>
    <div v-else-if="!lists.length" class="empty">No lists for this user.</div>

    <div v-else class="listGrid">
      <div v-for="l in lists" :key="l.id" class="listRow">
        <div class="left">
          <div class="name">{{ l.name }}</div>

          <div class="meta">
            <span v-if="l.space?.name" class="pill">Space: {{ l.space.name }}</span>
            <span class="muted">Created at {{ format(l.createdAt) }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="actionBtn" @click="edit(l)">Edit</button>
          <button class="actionBtn danger" @click="remove(l)">Delete</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {api} from '@/api/http'

const lists = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await api.get('/lists/user')
    lists.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openAdd() {
}

async function edit(l) {
  const next = prompt('Nieuwe naam voor de list:', l.name)
  if (!next || next.trim() === l.name) return
  await api.patch(`/lists/${l.id}`, {name: next.trim()})
  await load()
}

async function remove(l) {
  if (!confirm(`List "${l.name}" verwijderen?`)) return
  await api.delete(`/lists/${l.id}`)
  lists.value = lists.value.filter((item) => item.id !== l.id)
}

function format(d) {
  return new Date(d).toLocaleString()
}
</script>

<style scoped>
/* dezelfde “dashboard” look */
.listsPage {
  background: #2a3446;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  color: #e9eef7;
  min-height: 420px;
}

.listsHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}

.addBtn {
  height: 34px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.12);
  color: #e9eef7;
  font-weight: 800;
  cursor: pointer;
}

.addBtn:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.empty {
  padding: 16px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(233, 238, 247, 0.85);
}

.listGrid {
  display: grid;
  gap: 10px;
}

.listRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  background: #1f2836;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px;
}

.left {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.name {
  font-weight: 900;
  font-size: 14px;
  color: #e9eef7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.pill {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: rgba(233, 238, 247, 0.9);
}

.muted {
  opacity: 0.75;
}

.actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.actionBtn {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.12);
  color: #e9eef7;
  font-weight: 800;
  cursor: pointer;
}

.actionBtn:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.actionBtn.danger {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.35);
}

.actionBtn.danger:hover {
  border-color: rgba(239, 68, 68, 0.55);
}

/* responsive */
@media (max-width: 720px) {
  .listRow {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    justify-content: flex-end;
  }
}
</style>
