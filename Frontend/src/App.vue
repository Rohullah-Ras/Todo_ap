<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Task Manager</v-toolbar-title>
      <v-spacer/>
      <v-btn v-if="isLoggedIn" to="/board" variant="text">Board</v-btn>
      <v-btn v-if="!isLoggedIn" to="/login" variant="text">Login</v-btn>
      <v-btn v-if="!isLoggedIn" to="/register" variant="text">Register</v-btn>
      <v-btn v-if="isLoggedIn" variant="text" @click="logout">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useRouter} from 'vue-router';

const router = useRouter();

const isLoggedIn = computed(() => !!localStorage.getItem('fakeToken'));

const logout = () => {
  localStorage.removeItem('fakeToken');
  router.push('/login');
};
</script>
