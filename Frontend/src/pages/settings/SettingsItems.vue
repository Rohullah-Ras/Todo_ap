<template>
  <section class="listsPage">
    <div class="listsHeader">
      <h1>Your Lists</h1>
      <button class="addBtn" @click="openAdd">Add List +</button>
    </div>

    <div v-if="loading" class="empty">Loading lists...</div>
    <div v-else-if="!lists.length" class="empty">No lists for this user.</div>

    <div v-for="l in lists" :key="l.id" class="listRow">
      <div class="name">{{ l.name }}</div>
      <div class="meta">
        <span v-if="l.space?.name">Space: {{ l.space.name }}</span>
        <span>Created at {{ format(l.createdAt) }}</span>
      </div>
      <div class="actions">
        <button @click="edit(l)">Edit</button>
        <button @click="remove(l)">Delete</button>
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
  lists.value = lists.value.filter(item => item.id !== l.id)
}

function format(d) {
  return new Date(d).toLocaleString()
}
</script>
