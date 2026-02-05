<template>
  <v-container class="py-8" max-width="900">
    <h1 class="text-h4 mb-6">Validation Playground</h1>

    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="mode"
          :items="modeOptions"
          class="mb-6"
          density="comfortable"
          item-title="label"
          item-value="value"
          label="Endpoint"
        />

        <v-btn block class="mb-2" @click="loadExample('valid')">
          Example: valid
        </v-btn>
        <v-btn block class="mb-2" @click="loadExample('missing')">
          Example: missing prop {}
        </v-btn>
        <v-btn block class="mb-2" @click="loadExample('wrongType')">
          Example: wrong type (string)
        </v-btn>
        <v-btn block class="mb-2" @click="loadExample('extra')">
          Example: extra prop
        </v-btn>
      </v-col>

      <v-col cols="12" md="8">
        <v-textarea
          v-model="requestBody"
          auto-grow
          class="mb-4"
          label="Request JSON"
          rows="12"
        />

        <v-btn
          :loading="loading"
          color="primary"
          @click="sendRequest"
        >
          Send POST
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-10">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Success Response</v-card-title>
          <v-card-text>
            <pre v-if="successText" style="white-space: pre-wrap; font-size: 14px;">
{{ successText }}
            </pre>
            <span v-else class="text-medium-emphasis">No success yet.</span>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Error Response</v-card-title>
          <v-card-text>
            <pre v-if="errorText" style="white-space: pre-wrap; font-size: 14px;">
{{ errorText }}
            </pre>
            <span v-else class="text-medium-emphasis">No error yet.</span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

// ↓↓↓ ONLY THIS PART CHANGES FOR YOUR BACKEND ↓↓↓
const API_BASE = 'http://localhost:3005/api'

const mode = ref<'struct1' | 'struct2'>('struct1')

const modeOptions = [
  {label: 'struct1 (Partial<DTO>)', value: 'struct1'},
  {label: 'struct2 (? + @IsOptional)', value: 'struct2'},
]
// ↑↑↑ THAT'S IT ↑↑↑

const requestBody = ref<string>('{ "webwinkelId": 123 }')
const successText = ref('')
const errorText = ref('')
const loading = ref(false)

function loadExample(type: string) {
  const examples: Record<string, string> = {
    valid: '{ "webwinkelId": 123 }',
    missing: '{}',
    wrongType: '{ "webwinkelId": "abc" }',
    extra: '{ "webwinkelId": 123, "extra": "hello" }',
  }
  requestBody.value = examples[type] || '{ "webwinkelId": 123 }'
}

async function sendRequest() {
  successText.value = ''
  errorText.value = ''
  loading.value = true

  try {
    const url =
      mode.value === 'struct1'
        ? `${API_BASE}/test-accounts/struct1`
        : `${API_BASE}/test-accounts/struct2`

    const parsed = JSON.parse(requestBody.value)

    const res = await api.post(url.replace(API_BASE, ''), parsed)
    successText.value = JSON.stringify(res.data, null, 2)
  } catch (err: any) {
    if (err.response) {
      errorText.value = JSON.stringify(err.response.data, null, 2)
    } else {
      errorText.value = String(err)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
pre {
  background: #272727;
  color: #f2f2f2;
  padding: 12px;
  border-radius: 8px;
}
</style>
