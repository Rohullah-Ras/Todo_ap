<!-- src/views/LoginView.vue -->
<template>
  <v-container class="py-8" max-width="400">
    <v-card>
      <v-card-title class="text-h5">Login</v-card-title>
      <v-card-text>
        <v-form v-model="isValid" @submit.prevent="onSubmit">
          <v-text-field
            v-model="email"
            :rules="[rules.required, rules.email]"
            class="mb-3"
            label="Email"
            prepend-inner-icon="mdi-email"
            type="email"
          />
          <v-text-field
            v-model="password"
            :rules="[rules.required]"
            class="mb-4"
            label="Password"
            prepend-inner-icon="mdi-lock"
            type="password"
          />
          <v-btn
            :disabled="!isValid || loading"
            :loading="loading"
            block
            color="primary"
            type="submit"
          >
            Login
          </v-btn>
        </v-form>
        <div class="mt-4 text-caption">
          No account?
          <RouterLink to="/register">Register here</RouterLink>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/auth';
import {api} from '@/api/http' // of jouw axios instance pad

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

const submit = async () => {

  const res = await api.post('/auth/login', {
    email: email.value,
    password: password.value,
  })

  localStorage.setItem('access_token', res.data.access_token)
  router.push('/dashboard')
};
</script>
