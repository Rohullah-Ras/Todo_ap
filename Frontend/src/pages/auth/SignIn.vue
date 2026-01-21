<template>
  <div class="panel">
    <div class="heading">
      <div class="h1">SignIn</div>
      <div class="sub">Enter your details to continue</div>
    </div>

    <v-alert v-if="error" class="mb-4" color="red-darken-3" variant="tonal">
      {{ error }}
    </v-alert>

    <v-form class="form" @submit.prevent="submit">
      <v-text-field
        v-model.trim="email"
        :rules="[rules.required, rules.email]"
        autocomplete="email"
        label="Email"
        placeholder="Email address..."
        variant="underlined"
      />
      <v-text-field
        v-model="password"
        :rules="[rules.required, rules.min8]"
        autocomplete="current-password"
        label="Password"
        type="password"
        variant="underlined"
      />

      <div class="row">
        <v-checkbox v-model="remember" density="compact" hide-details label="Remember Me"/>
        <v-btn class="forgot" size="small" variant="text" @click="forgot">
          Forget password!
        </v-btn>
      </div>

      <v-btn :loading="loading" class="btn" color="black" type="submit">
        Sign In
      </v-btn>

      <div class="divider"><span>or</span></div>

      <div class="social">
        <v-btn class="sbtn" icon variant="tonal">
          <v-icon>mdi-google</v-icon>
        </v-btn>
        <v-btn class="sbtn" icon variant="tonal">
          <v-icon>mdi-facebook</v-icon>
        </v-btn>
        <v-btn class="sbtn" icon variant="tonal">
          <v-icon>mdi-twitter</v-icon>
        </v-btn>
      </div>

      <div class="bottom">
        <span>Don’t have an account?</span>
        <router-link class="link" to="/auth/sign-up">Sign Up -></router-link>
      </div>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false) // alleen UI; geen token storage
const loading = ref(false)
const error = ref('')

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email',
  min8: (v: string) => (v?.length ?? 0) >= 8 || 'Min 8 characters',
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.signIn({email: email.value, password: password.value})
    window.location.href = '/board'
  } catch (e: any) {
    const msg = e?.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join('\n') : (msg ?? 'Login failed.')
  } finally {
    loading.value = false
  }
}

function forgot() {
  // later: route of dialog
  error.value = 'Forgot password flow is not implemented yet.'
}
</script>

<style scoped>
.panel {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  color: #eaf0ff;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  color: rgba(234, 240, 255, 0.75);
}

.form :deep(.v-field__input) {
  color: #eaf0ff;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 14px;
}

.forgot {
  color: rgba(234, 240, 255, 0.75);
  text-transform: none;
}

.btn {
  width: 100%;
  border-radius: 12px;
  text-transform: none;
  font-weight: 700;
}

.divider {
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.divider span {
  font-size: 12px;
}

.social {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 14px;
}

.sbtn {
  border-radius: 12px;
}

.bottom {
  display: flex;
  gap: 10px;
  justify-content: center;
  font-size: 13px;
  opacity: 0.9;
}

.link {
  color: #eaf0ff;
  font-weight: 700;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
