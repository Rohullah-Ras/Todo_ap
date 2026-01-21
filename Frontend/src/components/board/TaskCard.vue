<template>
  <v-card class="card" flat>
    <v-card-text class="body">
      <div class="row">
        <v-checkbox
          v-model="localDone"
          class="chk"
          density="compact"
          hide-details
          @update:modelValue="onToggle"
        />

        <div class="content">
          <div :class="{ done: localDone }" class="t">{{ task.title }}</div>
          <div v-if="task.description" :class="{ done: localDone }" class="d">
            {{ task.description }}
          </div>
        </div>

        <div class="actions">
          <v-btn icon size="small" variant="text" @click="$emit('edit', task)">
            <v-icon size="18">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" @click="$emit('delete', task.id)">
            <v-icon size="18">mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="meta">
        Created: {{ new Date(task.createdAt).toLocaleString() }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'

const props = defineProps<{ task: any }>()
const emit = defineEmits(['toggleDone', 'edit', 'delete'])

const localDone = ref(!!props.task.isDone)

watch(
  () => props.task.isDone,
  (v) => (localDone.value = !!v),
)

function onToggle(v: boolean) {
  props.task.isDone = v
  emit('toggleDone', props.task)
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  margin-bottom: 10px;
}

.body {
  padding: 10px 10px 8px;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.chk {
  margin-top: -4px;
}

.content {
  flex: 1;
}

.t {
  font-weight: 800;
  color: #e8eefc;
  line-height: 1.2;
}

.d {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.85;
}

.done {
  text-decoration: line-through;
  opacity: 0.7;
}

.actions {
  display: flex;
  flex-direction: column;
}

.meta {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.7;
}
</style>
