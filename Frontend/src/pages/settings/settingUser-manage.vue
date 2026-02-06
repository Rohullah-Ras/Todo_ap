<template>
  <section class="userWrap">
    <div class="userHero">
      <div class="avatarBig">{{ initials }}</div>

      <div class="userName">{{ userName }}</div>
      <div class="userHandle">{{ userHandle }}</div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="statNum">
          {{ statsLoading ? '-' : stats.workspaces }}
        </div>
        <div class="statLbl">Work Space</div>
      </div>
      <div class="stat">
        <div class="statNum">
          {{ statsLoading ? '-' : stats.todo }}
        </div>
        <div class="statLbl">ToDo Task</div>
      </div>
      <div class="stat">
        <div class="statNum">
          {{ statsLoading ? '-' : stats.inProgress }}
        </div>
        <div class="statLbl">InProgress Task</div>
      </div>
      <div class="stat">
        <div class="statNum">
          {{ statsLoading ? '-' : stats.done }}
        </div>
        <div class="statLbl">Done Task</div>
      </div>
    </div>

    <div class="userForm">
      <div class="field">
        <div class="fieldLabel">Email</div>
        <div class="fieldLine">
          <input :value="userEmail" class="fieldInput" disabled type="email"/>
          <span class="fieldIcon">✉</span>
        </div>
      </div>

      <div class="field">
        <div class="fieldLabel">Password</div>
        <div class="fieldLine">
          <input class="fieldInput" disabled type="password" value="*************"/>
          <span class="fieldIcon">🙈</span>
        </div>
      </div>

      <button class="manageBtn" @click="manageAccount">Manage Account</button>
      <button class="backBtn" @click="$emit('back')">
        ← Back to profile
      </button>

    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useAuthStore} from '@/api/auth'
import {api} from '@/api/http'

const auth = useAuthStore()

const userEmail = computed(() => auth.userEmail ?? 'unknown@email.com')

const userName = computed(() => {
  const mail = auth.userEmail ?? ''
  const left = mail.split('@')[0] || 'User'
  return left.charAt(0).toUpperCase() + left.slice(1)
})

const userHandle = computed(() => {
  const mail = auth.userEmail ?? ''
  const left = mail.split('@')[0] || 'user'
  return `@${left}`
})

defineEmits(['back'])

const initials = computed(() => auth.userInitials)

const stats = ref({
  workspaces: 0,
  todo: 0,
  inProgress: 0,
  done: 0,
})

const statsLoading = ref(false)

async function loadStats() {
  statsLoading.value = true
  try {
    const res = await api.get('/stats/summary')
    stats.value = {
      workspaces: res.data?.workspaces ?? 0,
      todo: res.data?.todo ?? 0,
      inProgress: res.data?.inProgress ?? 0,
      done: res.data?.done ?? 0,
    }
  } catch {
    stats.value = {
      workspaces: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
    }
  } finally {
    statsLoading.value = false
  }
}

function manageAccount() {
  alert('Later: manage account')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.userWrap {
  height: 100%;
  display: grid;
  gap: 18px;
}

.userHero {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding-top: 10px;
}

.avatarBig {
  width: 92px;
  height: 92px;
  border-radius: 999px;
  background: #f59e0b;
  display: grid;
  place-items: center;
  font-size: 34px;
  color: #111827;
  border: 4px solid rgba(255, 255, 255, 0.25);
  font-weight: 900;
}

.userName {
  font-size: 22px;
  font-weight: 900;
}

.userHandle {
  opacity: 0.75;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
  padding: 10px 6px;
}

.stat {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  padding: 12px;
  text-align: center;
}

.statNum {
  font-size: 18px;
  font-weight: 900;
}

.statLbl {
  font-size: 12px;
  opacity: 0.75;
  margin-top: 4px;
}

.userForm {
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
}

.field {
  margin-bottom: 14px;
}

.fieldLabel {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 6px;
}

.fieldLine {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.22);
  padding-bottom: 6px;
}

.fieldInput {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  color: #e9eef7;
  padding: 6px 0;
}

.fieldInput:disabled {
  opacity: 0.9;
}

.fieldIcon {
  opacity: 0.7;
}

.manageBtn {
  margin-top: 10px;
  width: 180px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.25);
  color: #e9eef7;
  font-weight: 900;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
