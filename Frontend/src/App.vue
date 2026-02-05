<template>
  <v-app>
    <!--    <v-app-bar app>-->
    <!--      <v-spacer/>-->
    <!--      <v-btn v-if="isLoggedIn" to="/board" variant="text">Board</v-btn>-->
    <!--      <v-btn v-if="!isLoggedIn" to="/login" variant="text">Login</v-btn>-->
    <!--      <v-btn v-if="!isLoggedIn" to="/register" variant="text">Register</v-btn>-->
    <!--      <v-btn v-if="isLoggedIn" variant="text" @click="logout">Logout</v-btn>-->
    <!--    </v-app-bar>-->

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/api/auth'

const router = useRouter()
const auth = useAuthStore()

const isLoggedIn = computed(() => auth.isAuthenticated)

const logout = async () => {
  auth.logout()
  await router.push('/login')
}
</script>
