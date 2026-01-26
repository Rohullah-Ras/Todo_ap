<!-- src/views/RegisterView.vue -->
<template>
  <v-container class="py-8" max-width="400">
    <v-card>
      <v-card-title class="text-h5">Register</v-card-title>
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
            :rules="[rules.required, rules.min]"
            class="mb-3"
            label="Password"
            prepend-inner-icon="mdi-lock"
            type="password"
          />
          <v-text-field
            v-model="confirmPassword"
            :rules="[rules.required, matchPassword]"
            class="mb-4"
            label="Confirm Password"
            prepend-inner-icon="mdi-lock-check"
            type="password"
          />
          <v-btn
            :disabled="!isValid || loading"
            :loading="loading"
            block
            color="primary"
            type="submit"
          >
            Register
          </v-btn>
        </v-form>
        <div class="mt-4 text-caption">
          Already have an account?
          <RouterLink to="/login">Login here</RouterLink>
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
import {api} from '@/api/http' // of jouw axios instance pad


const router = useRouter();

const email = ref('');
const password = ref('');
const fullName = ref('');
const confirmPassword = ref('');
const isValid = ref(false);
const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
  min: (v: string) => v.length >= 6 || 'Min 6 characters',
};

const matchPassword = (v: string) =>
  v === password.value || 'Passwords must match';


const submit = async () => {
  const res = await api.post('/auth/register', {
    email: email.value,
    password: password.value,
    fullName: fullName.value,
  })

  localStorage.setItem('access_token', res.data.access_token)
  router.push('/dashboard')
}


</script>
