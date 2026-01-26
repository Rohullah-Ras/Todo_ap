<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {api} from '@/api/http'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agree = ref(false)

const loading = ref(false)
const errorMsg = ref('')

const submit = async () => {
  errorMsg.value = ''

  if (!agree.value) {
    errorMsg.value = 'Je moet akkoord gaan met de voorwaarden.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Wachtwoorden komen niet overeen.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'Wachtwoord moet minimaal 6 tekens zijn.'
    return
  }

  loading.value = true
  try {
    const res = await api.post('/auth/register', {
      email: email.value,
      password: password.value,
      fullName: fullName.value,
    })

    localStorage.setItem('access_token', res.data.access_token)
    router.push('/dashboard')
  } catch (e) {
    // simpele foutmelding (later kunnen we mooier maken)
    errorMsg.value = 'Registreren mislukt. Probeer een andere email.'
    console.error(e)
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
        <a class="link" href="#">Link four</a>
        <a class="link" href="#">Link three</a>
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
          <h1 class="title">SignUp</h1>
          <p class="subtitle">Create an account</p>

          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

          <form class="form" @submit.prevent="submit">
            <label class="field">
              <span class="label">Full Name</span>
              <input v-model="fullName" class="input" placeholder="Name..." type="text"/>
            </label>

            <label class="field">
              <span class="label">Enter your e-mail</span>
              <input v-model="email" class="input" placeholder="Email address..." required type="email"/>
            </label>

            <label class="field">
              <span class="label">Create Password</span>
              <input v-model="password" class="input" placeholder="********" required type="password"/>
            </label>

            <label class="field">
              <span class="label">Repeat password</span>
              <input v-model="confirmPassword" class="input" placeholder="********" required type="password"/>
            </label>

            <label class="checkbox">
              <input v-model="agree" type="checkbox"/>
              <span>I agree to the <b>Terms of User</b></span>
            </label>

            <div class="actions">
              <button :disabled="loading" class="btn" type="submit">
                {{ loading ? 'Signing up...' : 'Sign Up' }}
              </button>

              <button class="link-btn" type="button" @click="router.push('/login')">
                Sign In →
              </button>
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
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.6)),
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
}

.input:focus {
  border-color: #b8b8b8;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #555;
  margin-top: 4px;
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
  background: #f2b7b7;
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
