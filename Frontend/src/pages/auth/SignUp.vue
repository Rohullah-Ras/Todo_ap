<template>
  <div class="panel light">
    <div class="heading">
      <div class="h1">SignUp</div>
      <div class="sub">Create your account</div>
    </div>

    <v-alert v-if="error" class="mb-4" color="red-darken-3" variant="tonal">
      {{ error }}
    </v-alert>

    <v-form class="form" @submit.prevent="submit">
      <v-text-field v-model.trim="fullName" :rules="[rules.required]" autocomplete="name" label="Full Name"
                    placeholder="Name..." variant="underlined"/>
      <v-text-field v-model.trim="email" :rules="[rules.required, rules.email]" autocomplete="email" label="Enter your e-mail"
                    placeholder="Email address..." variant="underlined"/>
      <v-text-field v-model.trim="username" :rules="[rules.required, rules.username]" autocomplete="username" label="Create a username"
                    placeholder="Username..." variant="underlined"/>
      <v-text-field v-model="password" :rules="[rules.required, rules.min8]" autocomplete="new-password" label="Create Password"
                    type="password" variant="underlined"/>
      <v-text-field v-model="password2" :rules="[rules.required, () => password2 === password || 'Passwords do not match']" autocomplete="new-password" label="Repeat password"
                    type="password"
                    variant="underlined"/>

      <v-checkbox
        v-model="agree"
        class="mt-2"
        hide-details
        label="I agree to the Terms of User"
      />

      <v-btn :disabled="!agree" :loading="loading" class="btn2" color="pink-lighten-4" type="submit">
        Sign Up
      </v-btn>

      <div class="bottom">
        <router-link class="link2" to="/auth/sign-in">Sign In -></router-link>
      </div>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth'

const auth = useAuthStore()

const fullName = ref('')
const email = ref('')
const username = ref('')
const password = ref('')
const password2 = ref('')
const agree = ref(false)

const loading = ref(false)
const error = ref('')

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email',
  min8: (v: string) => (v?.length ?? 0) >= 8 || 'Min 8 characters',
  username: (v: string) => /^[a-zA-Z0-9._-]{3,20}$/.test(v) || '3-20 chars: letters/numbers/._-',
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.signUp({
      fullName: fullName.value,
      username: username.value,
      email: email.value,
      password: password.value,
    })
    window.location.href = '/board'
  } catch (e: any) {
    const msg = e?.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join('\n') : (msg ?? 'Sign up failed.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.panel {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.light {
  color: #f7f9ff;
}

.heading {
  margin-bottom: 18px;
}

.h1 {
  font-size: 28px;
  font-weight: 800;
}

.sub {
  opacity: 0.75;
  font-size: 12px;
  margin-top: 4px;
}

.form :deep(.v-field-label) {
  color: rgba(247, 249, 255, 0.75);
}

.form :deep(.v-field__input) {
  color: #f7f9ff;
}

.btn2 {
  width: 100%;
  margin-top: 14px;
  border-radius: 999px;
  text-transform: none;
  font-weight: 800;
  color: #222c40 !important;
}

.bottom {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.link2 {
  color: rgba(247, 249, 255, 0.9);
  font-weight: 700;
  text-decoration: none;
}

.link2:hover {
  text-decoration: underline;
}
</style>
