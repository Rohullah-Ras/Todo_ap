<script setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {api} from '@/api/http'

const router = useRouter()
const spaces = ref([])

onMounted(async () => {
  const res = await api.get('/spaces')
  spaces.value = res.data
})

const openSpace = (spaceId) => {
  router.push(`/board/${spaceId}`)
}

const logout = () => {
  localStorage.removeItem('access_token')
  router.push('/login')
}
</script>

<template>
  <div style="padding: 16px">
    <h2>Dashboard</h2>

    <button @click="logout">Logout</button>

    <h3>Spaces</h3>

    <ul>
      <li v-for="s in spaces" :key="s.id">
        <button @click="openSpace(s.id)">
          {{ s.name }} (id: {{ s.id }})
        </button>
      </li>
    </ul>
  </div>
</template>
