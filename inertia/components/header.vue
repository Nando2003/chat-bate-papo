<template>
  <header class="w-full bg-white shadow-sm border-b">
    <div class="max-w-screen-xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div>
          <Link href="/" class="text-2xl font-bold text-gray-800"> Bate-papo </Link>
        </div>

        <div class="flex items-center space-x-7">
          <span class="text-gray-600"> Hi, {{ displayName }} </span>

          <Link
            href="/logout"
            method="post"
            class="text-gray-600 hover:text-black font-medium transition-colors duration-200 ease-in-out"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'

interface User {
  fullName: string
  username: string
}

const page = usePage()
const user = computed(() => page.props.user as User)

const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.fullName?.trim() || user.value.username || ''
})
</script>
