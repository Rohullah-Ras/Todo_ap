<template>
  <section class="listsPage">
    <div class="listsHeader">
      <h1>Lists is nothing to show</h1>
      <button class="addBtn" @click="openAdd">Add List +</button>
    </div>

    <div v-for="l in lists" :key="l.id" class="listRow">
      <div class="name">{{ l.name }}</div>
      <div class="date">Created at {{ format(l.createdAt) }}</div>
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
const spaceId = Number(localStorage.getItem('active_space_id'))

async function load() {
  const res = await api.get(`/lists/space/${spaceId}`)
  lists.value = res.data
}

onMounted(load)

function openAdd() {
}

function edit(l) {
}

function remove(l) {
}

function format(d) {
  return new Date(d).toLocaleString()
}
</script>
