<!-- src/pages/settings/SettingsGeneral.vue -->
<template>
  <div class="card">
    <div class="title">Thema</div>

    <div class="row light">
      <div class="label">Light</div>
      <v-switch
        v-model="isLight"
        hide-details
        inset
        @update:modelValue="onLight"
      />
    </div>

    <div class="row dark">
      <div class="label">Dark</div>
      <v-switch
        v-model="isDark"
        hide-details
        inset
        @update:modelValue="onDark"
      />
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useTheme} from 'vuetify'

const theme = useTheme()

const isDark = computed({
  get: () => theme.global.name.value === 'dark',
  set: (v) => {
    theme.global.name.value = v ? 'dark' : 'light'
    localStorage.setItem('theme', theme.global.name.value)
  },
})

const isLight = computed({
  get: () => theme.global.name.value === 'light',
  set: (v) => {
    theme.global.name.value = v ? 'light' : 'dark'
    localStorage.setItem('theme', theme.global.name.value)
  },
})

// wireframe gedrag: 1 van de 2
function onLight(v) {
  if (v) isDark.value = false
  else isLight.value = true // kan niet “geen theme”
}

function onDark(v) {
  if (v) isLight.value = false
  else isDark.value = true
}
</script>

<style scoped>
.card {
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  max-width: 520px;
}

.title {
  font-weight: 900;
  margin-bottom: 12px;
  color: rgba(233, 238, 247, 0.9);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.label {
  font-weight: 700;
}

.row.light {
  background: rgba(255, 255, 255, 0.10);
}

.row.dark {
  background: rgba(0, 0, 0, 0.35);
}
</style>
