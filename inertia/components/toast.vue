<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { usePage } from '@inertiajs/vue3'

const page = usePage()

const visible = ref(false)
const type = ref<'success' | 'error' | 'info' | null>(null)
const message = ref('')

let timer: ReturnType<typeof setTimeout> | null = null

function show(t: 'success' | 'error' | 'info', msg: string) {
  type.value = t
  message.value = msg
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (visible.value = false), 4000)
}

function closeToast() {
  visible.value = false
  if (timer) clearTimeout(timer)
}

watch(
  () => (page.props as any).flash,
  (newFlash) => {
    if (!newFlash) return
    if (newFlash.success) show('success', newFlash.success)
    else if (newFlash.error) show('error', newFlash.error)
    else if (newFlash.info) show('info', newFlash.info)
  },
  { immediate: true, deep: true }
)

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

</script>

<template>
  <transition name="toast" appear>
    <div
      v-if="visible"
      class="fixed top-6 right-6 z-50 max-w-sm w-full"
      role="status"
      aria-live="polite"
    >
      <div
        class="flex items-start gap-3 p-4 rounded-lg shadow-xl border transition-colors duration-200 ease-in-out"
        :class="{
          'bg-green-50 border-green-200': type === 'success',
          'bg-red-50 border-red-200': type === 'error',
          'bg-blue-50 border-blue-200': type === 'info',
          'bg-white border-gray-200': type === null
        }"
      >
        <div class="mt-0.5">
          <svg v-if="type === 'success'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>

          <svg v-else-if="type === 'error'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>

          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
        </div>

        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">{{ message }}</p>
        </div>

        <button
          @click="closeToast"
          class="ml-2 text-sm opacity-60 hover:opacity-100"
          aria-label="Fechar"
          title="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  </transition>
</template>