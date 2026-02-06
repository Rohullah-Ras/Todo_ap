<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/api/auth.ts'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMsg = ref('')

const submit = async () => {
  errorMsg.value = ''

  if (!email.value || !password.value) {
    errorMsg.value = 'Vul email en wachtwoord in.'
    return
  }

  loading.value = true
  try {
    await auth.signIn({email: email.value, password: password.value})
    router.push('/dashboard')
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Login mislukt. Controleer je gegevens.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <!-- Top header -->
    <header class="topbar">
      <div class="brand">Task Manager</div>

      <nav class="links">
      </nav>

      <div class="icons">
        <button class="icon-btn" title="Help">?</button>
        <button class="icon-btn" title="Settings">⚙</button>
        <button class="icon-btn" title="Account">👤</button>
      </div>
    </header>

    <!-- Main content -->
    <main class="main">
      <section class="hero"/>

      <section class="panel">
        <div class="card">
          <h1 class="title">SignIn</h1>
          <p class="subtitle">Welcome back</p>

          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

          <form class="form" @submit.prevent="submit">
            <label class="field">
              <span class="label">Email</span>
              <input
                v-model="email"
                class="input"
                placeholder="Email address..."
                required
                type="email"
              />
            </label>

            <label class="field">
              <span class="label">Password</span>
              <input
                v-model="password"
                class="input"
                placeholder="********"
                required
                type="password"
              />
            </label>

            <div class="actions">
              <button :disabled="loading" class="btn" type="submit">
                {{ loading ? 'Signing in...' : 'Sign In' }}
              </button>

              <button class="link-btn" type="button" @click="router.push('/register')">
                Sign Up →
              </button>
            </div>

            <div class="hint">
              <span>Tip: na login ga je automatisch naar Dashboard.</span>
            </div>
          </form>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
}

/* top bar */
.topbar {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e7e7e7;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
}

.brand {
  font-weight: 700;
  font-size: 20px;
}

.links {
  margin-left: auto;
  display: flex;
  gap: 18px;
}

.link {
  color: #5a5a5a;
  text-decoration: none;
  font-size: 14px;
}

.link:hover {
  text-decoration: underline;
}

.icons {
  display: flex;
  gap: 10px;
  color: black;
  font-size: 20px;
  font-weight: bold;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #e1e1e1;
  background: #fff;
  border-radius: 999px;
  cursor: pointer;
}

/* layout */
.main {
  flex: 1;
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 24px;
  padding: 24px;
}

/* left big background */
.hero {
  border-radius: 18px;
  background: radial-gradient(circle at 30% 20%, #EAE0CF, #FCF8F8),
  linear-gradient(135deg, #f3f4f6, #eef1f6);
  border: 1px solid #e7e7e7;
  position: relative;
  overflow: hidden;
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  filter: blur(0.2px);
}

.hero::before {
  width: 220px;
  height: 28px;
  top: 46px;
  left: 110px;
}

.hero::after {
  width: 180px;
  height: 26px;
  bottom: 90px;
  left: 220px;
}

/* right panel */
.panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border: 1px solid #e7e7e7;
  border-radius: 16px;
  padding: 22px;
}

.title {
  margin: 0;
  font-size: 26px;
}

.subtitle {
  margin: 6px 0 14px 0;
  color: #777;
  font-size: 14px;
}

.error {
  background: #ffe8e8;
  border: 1px solid #ffbcbc;
  color: #8a1f1f;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 12px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  color: #666;
}

.input {
  height: 40px;
  border: 1px solid #dadada;
  border-radius: 10px;
  padding: 0 12px;
  outline: none;
  color: #333;
}

.input:focus {
  border-color: #b8b8b8;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.btn {
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: #c7d8ff;
  cursor: pointer;
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.link-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #555;
  font-weight: 600;
}

.link-btn:hover {
  text-decoration: underline;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #777;
}

/* responsive */
@media (max-width: 900px) {
  .main {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: 220px;
  }
}
</style>
