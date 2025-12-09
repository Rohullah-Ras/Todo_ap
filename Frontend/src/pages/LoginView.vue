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

const router = useRouter();

const email = ref('');
const password = ref('');
const isValid = ref(false);
const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
};

const onSubmit = async () => {
  if (!isValid.value) return;
  loading.value = true;

  try {
    // TODO: replace with real backend call later (e.g. /auth/login)
    if (email.value && password.value) {
      localStorage.setItem('fakeToken', 'dummy-token');
      snackbarMessage.value = 'Login successful!';
      snackbar.value = true;
      router.push('/board');
    } else {
      snackbarMessage.value = 'Invalid credentials';
      snackbar.value = true;
    }
  } catch (e) {
    snackbarMessage.value = 'Login failed';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};
</script>
