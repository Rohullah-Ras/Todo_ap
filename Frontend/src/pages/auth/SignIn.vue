<script lang="ts" setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/api/auth' // of '@/stores/auth' als je zo heet

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref('')

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email',
  min8: (v: string) => (v?.length ?? 0) >= 8 || 'Min 8 characters',
}

async function submit() {
  if (loading.value) return // ✅ voorkomt dubbele submit
  error.value = ''
  loading.value = true
  try {
    await auth.signIn({email: email.value, password: password.value})
    await router.push('/dashboard')
  } catch (e: any) {
    const msg = e?.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join('\n') : (msg ?? 'Login failed.')
  } finally {
    loading.value = false
  }
}
</script>
