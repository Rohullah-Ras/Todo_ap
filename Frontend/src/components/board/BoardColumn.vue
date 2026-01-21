<template>
  <div class="col">
    <div class="col-head">
      <div class="title">
        <span class="label">{{ title }}</span>
        <span class="count">{{ count }}/0</span>
      </div>
      <v-icon v-if="title==='DONE'" class="mini" size="18">mdi-format-list-checks</v-icon>
    </div>

    <draggable
      v-model="localTasks"
      :data-list-key="listKey"
      class="dropzone"
      group="tasks"
      item-key="id"
      @end="handleEnd"
    >
      <template #item="{ element }">
        <TaskCard
          :task="element"
          @delete="$emit('delete', $event)"
          @edit="$emit('edit', $event)"
          @toggleDone="$emit('toggleDone', $event)"
        />
      </template>
    </draggable>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'

type Task = any

const props = defineProps<{
  title: string
  count: number
  tasks: Task[]
  listKey: string
}>()

const emit = defineEmits<{
  (e: 'move', payload: { taskId: number; toKey: string }): void
  (e: 'toggleDone', task: Task): void
  (e: 'edit', task: Task): void
  (e: 'delete', taskId: number): void
}>()

// v-model proxy
const localTasks = computed({
  get: () => props.tasks,
  set: () => {
  }, // parent beheert state (we muteren parent arrays via v-model binding in parent)
})

async function handleEnd(evt: any) {
  const toKey = evt?.to?.dataset?.listKey
  const moved = evt?.to ? (evt.to.__draggable_component__?.realList?.[evt.newIndex]) : null

  // fallback: probeer uit DOM event te halen
  const task = moved ?? props.tasks?.[evt.newIndex]

  if (!toKey || !task?.id) return

  try {
    emit('move', {taskId: Number(task.id), toKey})
  } catch {
    // parent kan eventueel reload doen
  }
}
</script>

<style scoped>
.col {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 16px;
  padding: 12px;
  min-height: 460px;
}

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 4px 6px;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: #f6b11a; /* to-do accent; je kunt per kolom variëren */
}

.count {
  font-size: 11px;
  opacity: 0.75;
}

.dropzone {
  min-height: 400px;
}

.mini {
  opacity: 0.85;
}
</style>
