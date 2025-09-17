<template>
  <Head title="Login" />
  <Toast />

  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-xl bg-white rounded-lg shadow-xl p-8">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">Welcome to Bate-papo</h2>
      </div>

      <div
        v-if="props.error"
        class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 border border-red-300 text-center"
      >
        {{ props.error }}
      </div>

      <form @submit.prevent="loginRequest" autocomplete="off">
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-1">
            <label for="registration" class="block font-semibold">Username or e-mail</label>
            <input
              type="text"
              name="registration"
              id="registration"
              placeholder="youremail@example.com | yourusername"
              v-model="loginForm.registration"
              required
              class="block w-full border-2 px-3 py-2 rounded-md border-gray-400 focus:border-black transition-colors duration-200 ease-in-out"
            />
            <p v-if="loginForm.errors.registration" class="text-sm text-red-700">
              {{ loginForm.errors.registration }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <label for="password" class="block font-semibold">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="********"
              v-model="loginForm.password"
              required
              class="block w-full border-2 px-3 py-2 rounded-md border-gray-400 focus:border-black transition-colors duration-200 ease-in-out"
            />
            <p v-if="loginForm.errors.password" class="text-sm text-red-700">
              {{ loginForm.errors.password }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <button
              type="submit"
              class="font-semibold py-2 px-4 rounded-md text-white bg-gray-400 hover:bg-black transition-colors duration-200 ease-in-out"
            >
              Login
            </button>

            <a href="/register" class="text-sm text-gray-400 hover:underline self-center">
              Don't have an account? Sign up
            </a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3'
import Toast from '../../components/toast.vue'
import { computed } from 'vue'

const page = usePage()

interface FlashMessages {
  error?: string
  success?: string
}

const props = computed(() => page.props.flash as FlashMessages)

const loginForm = useForm({
  registration: '',
  password: '',
})

const loginRequest = () => {
  loginForm.post('/login')
}
</script>
