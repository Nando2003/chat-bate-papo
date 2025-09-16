<template>
  <Head title="Register" />

  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-xl bg-white rounded-lg shadow-xl p-8">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">Sign up to start chatting</h2>
      </div>

      <form @submit.prevent="registerRequest" autocomplete="off">
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-1">
            <label for="fullName" class="block font-semibold">Name</label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              placeholder="Your full name"
              v-model="registerForm.fullName"
              required
              class="block w-full border-2 px-3 py-2 rounded-md border-gray-400 focus:border-black transition-colors duration-200 ease-in-out"
            />
            <p v-if="registerForm.errors.fullName" class="text-sm text-red-700">
              {{ registerForm.errors.fullName }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <label for="username" class="block font-semibold">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="yourusername"
              v-model="registerForm.username"
              @input="onUsernameInput"
              required
              class="block w-full border-2 px-3 py-2 rounded-md border-gray-400 focus:border-black transition-colors duration-200 ease-in-out"
            />
            <p v-if="registerForm.errors.username" class="text-sm text-red-700">
              {{ registerForm.errors.username }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <label for="email" class="block font-semibold">E-mail</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="youremail@example.com"
              v-model="registerForm.email"
              required
              class="block w-full border-2 px-3 py-2 rounded-md border-gray-400 focus:border-black transition-colors duration-200 ease-in-out"
            />
            <p v-if="registerForm.errors.email" class="text-sm text-red-700">
              {{ registerForm.errors.email }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <label for="password" class="block font-semibold">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="********"
              v-model="registerForm.password"
              required
              class="block w-full border-2 px-3 py-2 rounded-md border-gray-400 focus:border-black transition-colors duration-200 ease-in-out"
            />
            <p v-if="registerForm.errors.password" class="text-sm text-red-700">
              {{ registerForm.errors.password }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <label for="confirmPassword" class="block font-semibold">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="********"
              v-model="registerForm.confirmPassword"
              required
              class="block w-full border-2 px-3 py-2 rounded-md border-gray-400 focus:border-black transition-colors duration-200 ease-in-out"
            />
            <p v-if="registerForm.errors.confirmPassword" class="text-sm text-red-700">
              {{ registerForm.errors.confirmPassword }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <button
              type="submit"
              class="font-semibold py-2 px-4 rounded-md text-white bg-gray-400 hover:bg-black transition-colors duration-200 ease-in-out"
            >
              Register
            </button>

            <a href="/login" class="text-sm text-gray-400 hover:underline self-center">
              Already have an account? Log in
            </a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'

const registerForm = useForm({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const registerRequest = () => {
  registerForm.post('/register')
}

const onUsernameInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  const sanitized = el.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')
  registerForm.username = sanitized
  el.value = sanitized
}
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
